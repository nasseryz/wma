import React from 'react';

interface ScrollProps {
  children: React.ReactNode;
}

const Scroll: React.FC<ScrollProps> = ({ children }) => {
  return (
    <div className="overflow-y-auto max-h-[70vh] rounded-lg shadow-inner">
      {children}
    </div>
  );
};

export default Scroll; 