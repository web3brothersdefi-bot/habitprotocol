import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Icon */}
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light rounded-2xl blur-sm opacity-75"></div>
        <div className="relative bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center h-full">
          <span className="text-white font-bold text-2xl">H</span>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold gradient-text">Habit</span>
          <span className="text-xs text-grey -mt-1">Turn Habits Into Hustle</span>
        </div>
      )}
    </motion.div>
  );
};

export default Logo;
