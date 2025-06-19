export const generatePath = (points, smooth = true) => {
  if (points.length < 2) return '';

  if (!smooth) {
    return points.reduce((path, point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
    }, '');
  }

  // Generate smooth curve using cubic bezier
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    const tension = 0.3;
    
    if (i === 1) {
      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y + (curr.y - prev.y) * tension;
      path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
    } else if (i === points.length - 1) {
      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y + (curr.y - prev.y) * tension;
      path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
    } else {
      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y + (curr.y - prev.y) * tension;
      const cp2x = curr.x - (next.x - prev.x) * tension;
      const cp2y = curr.y - (next.y - prev.y) * tension;
      path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
    }
  }
  
  return path;
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateTrend = (data) => {
  const values = Object.values(data);
  if (values.length < 2) return { trend: 'stable', percentage: 0 };
  
  const current = values[values.length - 1];
  const previous = values[values.length - 2];
  
  if (current === previous) return { trend: 'stable', percentage: 0 };
  
  const percentage = Math.abs(((current - previous) / previous) * 100);
  return {
    trend: current > previous ? 'up' : 'down',
    percentage: Math.round(percentage)
  };
};
