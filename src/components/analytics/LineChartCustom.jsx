import React from 'react';
import { generatePath } from '../../utils/chartUtils';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';


export const LineChartCustom = ({
  data,
  title,
  color = '#3B82F6',
  height = 300,
  showDots = true,
  showArea = true
}) => {
  const { ref, isVisible } = useIntersectionObserver();
  
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const padding = 40;
  const width = 400;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const points = data.map((point, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y: padding + (1 - (point.value - minValue) / (maxValue - minValue)) * chartHeight
  }));

  const linePath = generatePath(points, true);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div ref={ref} className="bg-card-elevated/50 backdrop-blur-xl border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
      
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3"/>
            </pattern>
            <linearGradient id={`area-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Area fill */}
          {showArea && (
            <path
              d={areaPath}
              fill={`url(#area-gradient-${color.replace('#', '')})`}
              className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              strokeDasharray: isVisible ? 'none' : '1000',
              strokeDashoffset: isVisible ? '0' : '1000',
            }}
          />
          
          {/* Data points */}
          {showDots && points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={color}
                className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
                className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              />
            </g>
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-4 px-2">
          {data.map((point, index) => (
            <span key={index} className="text-xs text-muted-foreground">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};