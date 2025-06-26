'use client';

/**
 * Component for displaying status/feedback messages
 */
const StatusMessage = ({ type, message }) => {
  if (!message) return null;
  
  const styles = {
    success: 'bg-success/10 text-success border border-success/20',
    error: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-info/10 text-info border border-info/20',
    warning: 'bg-warning/10 text-warning border border-warning/20'
  };
  
  return (
    <div className={`p-3 rounded-md ${styles[type] || ''}`}>
      {message}
    </div>
  );
};

export { StatusMessage };
