import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const socketAuthMiddleware = (socket, next) => {
  try {
    const cookieHeader = socket.request.headers.cookie;

    if (!cookieHeader) {
      console.warn("⚠️ No se enviaron cookies en la solicitud");
      socket.data.user = null;
      return next();
    }

    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );

    let token = cookies['token'];

    if (!token) {
      console.warn("⚠️ Authentication token missing in cookies");
      socket.data.user = null;
      return next();
    }

    token = token.replace(/^"|"$/g, '');

    const decoded = jwt.verify(token, JWT_SECRET);

    socket.data.user = decoded;

    console.log(`✅ Auth JWT Exitosa: ${decoded.Nombre || decoded.id}`);
    next();

  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    socket.data.user = null;
    next();
  }
};