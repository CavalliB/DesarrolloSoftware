import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const Timer = forwardRef(({ onFinish }, ref) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useImperativeHandle(ref, () => ({
    getSeconds: () => seconds,
    stop: () => setIsActive(false),
  }), [seconds]);

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
    </div>
  );
});

export default Timer;