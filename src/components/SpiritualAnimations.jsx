import { useEffect, useState } from 'react';
import './SpiritualAnimations.css';

// Flying boxes animation when activity is saved
export const FlyingBoxes = ({ trigger, onComplete }) => {
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    if (trigger) {
      // Create 8-12 flying boxes with Hare Krishna colors
      const newBoxes = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
      }));

      setBoxes(newBoxes);

      // Clean up after animation
      const timer = setTimeout(() => {
        setBoxes([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (boxes.length === 0) return null;

  return (
    <div className="flying-boxes-container">
      {boxes.map((box) => (
        <div
          key={box.id}
          className="flying-box"
          style={{
            left: `${box.left}%`,
            animationDelay: `${box.delay}s`,
            animationDuration: `${box.duration}s`,
            '--rotation': `${box.rotation}deg`,
          }}
        >
          <div className="box-content">
            <span className="krishna-symbol">
              <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="floating-message-logo" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Floating Hare Krishna messages in peacock-like structure
export const FloatingMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Create initial messages with peacock-like curved paths
    const createMessage = () => {
      const id = Date.now() + Math.random();
      // Create curved path like peacock feathers - starting from different positions
      const startSide = Math.random() > 0.5 ? 'left' : 'right';
      const verticalPosition = 20 + Math.random() * 60; // Between 20% and 80% from top
      const curveIntensity = 50 + Math.random() * 100; // Curve height
      const delay = Math.random() * 3;
      const duration = 20 + Math.random() * 10;

      return {
        id,
        text: 'Hare Krishna',
        startSide,
        verticalPosition,
        curveIntensity,
        delay: delay,
        duration: duration,
      };
    };

    // Add initial messages (peacock tail structure - multiple messages)
    const initialMessages = Array.from({ length: 5 }, () => createMessage());
    setMessages(initialMessages);

    // Add new messages periodically to maintain peacock-like flow
    const interval = setInterval(() => {
      setMessages((prev) => {
        // Remove old messages (older than 30 seconds)
        const filtered = prev.filter((msg) => {
          const age = Date.now() - msg.id;
          return age < 30000;
        });

        // Add new message if we have less than 6 (peacock tail has many feathers)
        if (filtered.length < 6) {
          return [...filtered, createMessage()];
        }
        return filtered;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="floating-messages-container">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`floating-message peacock-${message.startSide}`}
          style={{
            top: `${message.verticalPosition}%`,
            animationDelay: `${message.delay}s`,
            animationDuration: `${message.duration}s`,
            '--curve-intensity': `${message.curveIntensity}px`,
          }}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

// Success celebration animation
export const SuccessCelebration = ({ trigger, message = 'Hare Krishna! Activity Saved!' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="success-celebration">
      <div className="celebration-content">
        <div className="celebration-icon">
          <img src="/images/iskcon-logo.png" alt="ISKCON Logo" className="celebration-logo" />
        </div>
        <div className="celebration-message">{message}</div>
        <div className="celebration-particles">
          {Array.from({ length: 20 }, (_, i) => {
            const angle = (i / 20) * 360;
            const distance = 100 + Math.random() * 50;
            const x = Math.cos((angle * Math.PI) / 180) * distance;
            const y = Math.sin((angle * Math.PI) / 180) * distance;
            return (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  '--delay': `${i * 0.05}s`,
                  '--x': `${x}px`,
                  '--y': `${y}px`
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

