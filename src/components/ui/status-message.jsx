'use client';

/**
 * Component for displaying status/feedback messages
 */
const StatusMessage = ({ type, message }) => {
  if (!message) return null;
  
  const styles = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  };
  
  return (
    <div className={`p-3 rounded-md ${styles[type] || ''}`}>
      {message}
    </div>
  );
};

export { StatusMessage };
