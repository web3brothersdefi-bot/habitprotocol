import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  maxLength,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-grey mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-grey">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={`input-glass ${icon ? 'pl-12' : ''} ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        
        {maxLength && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-grey">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export const TextArea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-grey mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={rows}
          className={`input-glass resize-none ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        
        {maxLength && (
          <div className="absolute right-4 bottom-4 text-xs text-grey">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
