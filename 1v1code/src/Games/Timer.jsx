import { useState, useEffect } from 'react';

const Timer = ({ onFinish }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    if (onFinish) {
      onFinish(seconds);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#333',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '4px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '1.2em' }}>{formatTime(seconds)}</span>
      <button 
        onClick={handleFinish}
        style={{
          padding: '4px 8px',
          backgroundColor: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Finalizar
      </button>
    </div>
  );
};

export default Timer;