import React, { useEffect, useState, useRef } from 'react';

interface Insight {
  id: string;
  message: string;
  type: 'positive' | 'negative' | 'neutral';
  value?: number;
  change?: number;
  changePercent?: number;
  icon?: string;
}

interface InsightsBarProps {
  insights: Insight[];
}

export const InsightsBar: React.FC<InsightsBarProps> = ({ insights }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);

  useEffect(() => {
    if (!scrollRef.current || insights.length === 0) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    let scrollPosition = 0;

    const scroll = () => {
      if (!isScrolling) return;
      
      scrollPosition += 1;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    if (isScrolling) {
      animationId = requestAnimationFrame(scroll);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isScrolling, insights]);

  const getInsightColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'neutral':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getChangeIcon = (changePercent?: number) => {
    if (!changePercent) return null;
    
    if (changePercent > 0) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 7z" clipRule="evenodd" />
        </svg>
      );
    } else if (changePercent < 0) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 13a1 1 0 110 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L12 13z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const formatValue = (value?: number) => {
    if (value === undefined) return '';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (insights.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-cymbal-accent to-cymbal-accent-dark py-3 overflow-hidden">
        <div className="flex items-center justify-center text-white text-sm font-medium">
          <div className="animate-pulse">Loading insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-[9998] w-full bg-gradient-to-r from-cymbal-accent to-cymbal-accent-dark py-3 overflow-hidden">
      <div className="flex items-center space-x-2">
        {/* Pause/Play Button */}
        <button
          onClick={() => setIsScrolling(!isScrolling)}
          className="text-white hover:text-cymbal-light transition-colors duration-200 ml-4"
        >
          {isScrolling ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Scrolling Insights */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center space-x-6 overflow-hidden whitespace-nowrap"
          style={{ scrollBehavior: 'smooth' }}
        >
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full border-2 ${getInsightColor(insight.type)} shadow-sm transition-all duration-200 hover:scale-105`}
            >
              {/* Icon */}
              {insight.icon && (
                <span className="text-lg">{insight.icon}</span>
              )}
              
              {/* Message */}
              <span className="font-semibold text-sm whitespace-nowrap">
                {insight.message}
              </span>
              
              {/* Value and Change */}
              {insight.value !== undefined && (
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-sm">
                    {formatValue(insight.value)}
                  </span>
                  {insight.changePercent !== undefined && (
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(insight.changePercent)}
                      <span className={`text-xs font-medium ${
                        insight.changePercent > 0 ? 'text-green-600' : 
                        insight.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Duplicate insights for seamless scrolling */}
          {insights.map((insight) => (
            <div
              key={`${insight.id}-duplicate`}
              className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full border-2 ${getInsightColor(insight.type)} shadow-sm transition-all duration-200 hover:scale-105`}
            >
              {insight.icon && (
                <span className="text-lg">{insight.icon}</span>
              )}
              
              <span className="font-semibold text-sm whitespace-nowrap">
                {insight.message}
              </span>
              
              {insight.value !== undefined && (
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-sm">
                    {formatValue(insight.value)}
                  </span>
                  {insight.changePercent !== undefined && (
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(insight.changePercent)}
                      <span className={`text-xs font-medium ${
                        insight.changePercent > 0 ? 'text-green-600' : 
                        insight.changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
