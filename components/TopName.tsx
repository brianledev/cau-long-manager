
"use client";
// components/TopName.tsx
import React from 'react';

export function TopName({ children, rank }: { children: React.ReactNode, rank?: number }) {
  const [prevRank, setPrevRank] = React.useState(rank);
  const [animate, setAnimate] = React.useState(false);
  React.useEffect(() => {
    if (rank !== prevRank) {
      setAnimate(true);
      setPrevRank(rank);
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [rank, prevRank]);

  // Hiệu ứng cầu vồng đầy đủ (đỏ, vàng, xanh lá, xanh dương, tím)
  let gradient =
    'linear-gradient(90deg, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(220, 100%, 55%), hsl(240, 100%, 50%), hsl(275, 100%, 60%), hsl(300, 80%, 60%), hsl(320, 80%, 60%), hsl(0, 100%, 50%))';
  let animation = 'rainbow-hsl-move 4s ease-in-out infinite alternate';

    return (
      <span
        className={`rainbow-hsl-text font-bold transition-all duration-500 ${animate ? 'topname-animate' : ''}`}
        style={{
          background: gradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 100%',
          animation,
          transition: 'background 0.5s, transform 0.5s',
          transform: animate ? 'scale(1.15)' : 'scale(1)',
          opacity: animate ? 0.7 : 1,
        }}
      >
        {children}
      </span>
    );

  return (
    <span
      className={`font-bold transition-all duration-500 ${animate ? 'topname-animate' : ''}`}
      style={{
        background: gradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '110% 100%',
        animation,
        transition: 'background 0.5s, transform 0.5s',
        transform: animate ? 'scale(1.15)' : 'scale(1)',
        opacity: animate ? 0.7 : 1,
      }}
    >
      {children}
    </span>
  );
}

// Thêm vào global CSS nếu chưa có:
// .topname-animate {
//   animation: topname-fade 0.6s;
// }
// @keyframes topname-fade {
//   0% { opacity: 0.5; transform: scale(1.2); }
//   100% { opacity: 1; transform: scale(1); }
// }

// CSS animation (add to global CSS if not present)
// @keyframes gradient-x {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }
// .animate-gradient-x {
//   animation: gradient-x 3s ease-in-out infinite;
//   background-size: 200% 200%;
// }
