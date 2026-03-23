import React from 'react';

export const Display: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`text-4xl md:text-7xl lg:text-9xl font-bold tracking-tighter leading-[0.9] uppercase break-words ${className}`}>
    {children}
  </h1>
);

export const Heading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-2xl md:text-4xl font-bold uppercase tracking-tighter ${className}`}>
    {children}
  </h2>
);

export const SubHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold uppercase tracking-tight leading-none ${className}`}>
    {children}
  </h3>
);

export const Mono: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`font-mono text-xs uppercase tracking-widest ${className}`}>
    {children}
  </div>
);

export const Body: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm md:text-base leading-relaxed text-gray-800 ${className}`}>
    {children}
  </p>
);
