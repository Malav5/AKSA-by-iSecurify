import React from 'react';

const SecuritySymbol = ({ type, ...props }) => {
  const symbols = {
    shield: (
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.4 9.16-7 10.35-3.6-1.2-7-5.52-7-10.35v-4.7l7-3.12z" />
    ),
    fingerprint: (
      <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z" />
    ),
    lock: (
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    ),
    key: (
      <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    ),
    security: (
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    )
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {symbols[type]}
    </svg>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* White Background */}
      <div className="absolute inset-0 bg-white" />

      {/* Security Symbols */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 70 }).map((_, i) => {
          const symbols = ['shield', 'fingerprint', 'lock', 'key', 'security'];
          const type = symbols[i % symbols.length];
          const size = Math.random() * 50 + 20;
          
          // Calculate position based on a more uniform grid distribution
          const numIcons = 70;
          const gridSize = Math.ceil(Math.sqrt(numIcons));
          
          const baseLeft = (i % gridSize) * (100 / gridSize);
          const baseTop = Math.floor(i / gridSize) * (100 / gridSize);

          // Add a smaller random jitter from the grid position
          const randomOffset = 10; // Reduced Maximum offset percentage
          const xOffset = (Math.random() - 0.5) * randomOffset;
          const yOffset = (Math.random() - 0.5) * randomOffset;
          
          const finalLeft = Math.min(Math.max(baseLeft + xOffset, 2), 98); // Clamp within 2% and 98%
          const finalTop = Math.min(Math.max(baseTop + yOffset, 2), 98); // Clamp within 2% and 98%

          return (
            <div
              key={i}
              className="absolute text-[#800080]"
              style={{
                width: size + 'px',
                height: size + 'px',
                left: `${finalLeft}%`,
                top: `${finalTop}%`,
                animation: `moveFreely ${Math.random() * 30 + 25}s infinite ease-in-out`,
                '--initial-rotate': `${Math.random() * 360}deg`,
                '--move-x-1': `${(Math.random() - 0.5) * 200}px`,
                '--move-y-1': `${(Math.random() - 0.5) * 200}px`,
                '--rotate-1': `${Math.random() * 360}deg`,
                '--move-x-2': `${(Math.random() - 0.5) * 200}px`,
                '--move-y-2': `${(Math.random() - 0.5) * 200}px`,
                '--rotate-2': `${Math.random() * 360}deg`,
                '--move-x-3': `${(Math.random() - 0.5) * 200}px`,
                '--move-y-3': `${(Math.random() - 0.5) * 200}px`,
                '--rotate-3': `${Math.random() * 360}deg`,
                opacity: Math.random() * 0.25 + 0.15
              }}
            >
              <SecuritySymbol type={type} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedBackground; 