import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  onClick = null,
  ...props
}) => {
  const baseClass = gradient ? 'card-gradient-border' : hover ? 'glass-card-hover' : 'glass-card';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`${baseClass} ${cursorClass} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover && onClick ? { y: -5 } : {}}
      {...props}
    >
      {gradient ? <div className="p-6">{children}</div> : children}
    </motion.div>
  );
};

export default Card;
