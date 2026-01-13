import { jest } from '@jest/globals'

jest.unstable_mockModule('../../Supabase.js', () => ({
    supabase: {
        from: jest.fn()
    }
}))

const { getJuegos, getHistorialPartidas } =
    await import('../../controllers/gameController.js')

const { supabase } =
    await import('../../Supabase.js')

const mockRes = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn()
    return res
}

describe('gameController', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getJuegos', () => {

        test('devuelve 200 y lista de juegos', async () => {
            supabase.from.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data: [{ id: 1, nombre: 'Juego 1' }],
                    error: null
                })
            })

            const req = {}
            const res = mockRes()

            await getJuegos(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Juego 1' }])
        })

        test('devuelve 500 si Supabase falla', async () => {
            supabase.from.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'DB error' }
                })
            })

            const req = {}
            const res = mockRes()

            await getJuegos(req, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
        })

    })

    describe('getHistorialPartidas', () => {

        test('retorna 401 si el usuario no está autenticado', async () => {
            const req = { user: null }
            const res = mockRes()

            await getHistorialPartidas(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
        })

        test('devuelve partidas con nombre del oponente', async () => {
            const req = { user: { id: 1 } }
            const res = mockRes()

            supabase.from.mockImplementation((table) => {
                if (table === 'Partida') {
                    return {
                        select: () => ({
                            or: () => ({
                                order: jest.fn().mockResolvedValue({
                                    data: [{ Jugador1: 1, Jugador2: 2 }],
                                    error: null
                                })
                            })
                        })
                    }
                }

                if (table === 'Usuario') {
                    return {
                        select: jest.fn().mockResolvedValue({
                            data: [
                                { id: 1, Nombre: 'Juan' },
                                { id: 2, Nombre: 'Pedro' }
                            ],
                            error: null
                        })
                    }
                }
            })

            await getHistorialPartidas(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
        })

    })

})
