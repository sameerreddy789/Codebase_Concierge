import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ className, ...props }) => {
  return (
    <input
      className={twMerge(
        'w-full bg-white/50 border border-white/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all clay-inset',
        className
      )}
      {...props}
    />
  );
};

export default Input;
