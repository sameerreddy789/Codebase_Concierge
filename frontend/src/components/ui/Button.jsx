import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-indigo-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:bg-indigo-600',
    clay: 'clay-button text-indigo-600 font-semibold',
    ghost: 'hover:bg-slate-100 text-slate-600',
  };

  return (
    <button
      className={twMerge(
        'px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
