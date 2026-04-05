import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Top Right (A-B-G) */}
    <path d="M50 0 L93.3 25 L50 50 Z" fill="#357558" />
    {/* Right (B-C-G) */}
    <path d="M93.3 25 L93.3 75 L50 50 Z" fill="#1A402E" />
    {/* Bottom Right (C-D-G) */}
    <path d="M93.3 75 L50 100 L50 50 Z" fill="#265942" />
    {/* Bottom Left (D-E-G) */}
    <path d="M50 100 L6.7 75 L50 50 Z" fill="#438E6C" />
    {/* Left (E-F-G) */}
    <path d="M6.7 75 L6.7 25 L50 50 Z" fill="#68C49A" />
    {/* Top Left (F-A-G) */}
    <path d="M6.7 25 L50 0 L50 50 Z" fill="#52A37D" />
    
    {/* Inner lines for definition */}
    <path d="M50 0 L50 50" stroke="#E5F7EE" strokeWidth="0.5" opacity="0.3" />
    <path d="M93.3 25 L50 50" stroke="#E5F7EE" strokeWidth="0.5" opacity="0.3" />
    <path d="M93.3 75 L50 50" stroke="#E5F7EE" strokeWidth="0.5" opacity="0.3" />
    <path d="M50 100 L50 50" stroke="#E5F7EE" strokeWidth="0.5" opacity="0.3" />
    <path d="M6.7 75 L50 50" stroke="#E5F7EE" strokeWidth="0.5" opacity="0.3" />
    <path d="M6.7 25 L50 50" stroke="#E5F7EE" strokeWidth="0.5" opacity="0.3" />
  </svg>
);
