import React from 'react';

const Wheel = ({ categories, onCategoryClick }) => {
  const renderWheel = () => {
    // Calculate total value to determine proportions
    const totalValue = categories.reduce((sum, category) => sum + (category.value || 1), 0);
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;

    let currentAngle = -Math.PI / 2; // Start from top

    return categories.map((category, index) => {
      const value = category.value || 1; // Default to 1 if no value is specified
      const sliceAngle = (value / totalValue) * 2 * Math.PI;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      const x1 = centerX + maxRadius * Math.cos(startAngle);
      const y1 = centerY + maxRadius * Math.sin(startAngle);
      const x2 = centerX + maxRadius * Math.cos(endAngle);
      const y2 = centerY + maxRadius * Math.sin(endAngle);
      
      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${maxRadius} ${maxRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Calculate text position
      const textAngle = startAngle + sliceAngle / 2;
      const textRadius = maxRadius * 0.65; // Position text at 65% of radius
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);

      // Update currentAngle for next slice
      currentAngle = endAngle;

      return (
        <g key={index}>
          <path
            d={pathData}
            fill={category.color}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onCategoryClick(category.name)}
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="600"
            fill="#333"
            pointerEvents="none"
          >
            {category.name.split(' ').map((word, i, arr) => (
              <tspan key={i} x={textX} dy={i === 0 ? '0' : '14'}>
                {word}
              </tspan>
            ))}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Life Balance Pie Chart</h2>
      <p className="mb-6 text-gray-600">Click on segments to focus on specific areas of your life. Size represents importance/value.</p>
      
      <div className="flex justify-center">
        <svg className="w-96 h-96 max-w-full" viewBox="0 0 400 400">
          {renderWheel()}
        </svg>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
            <div 
              className="w-4 h-4 rounded-sm" 
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="text-sm">{category.name}</span>
            <span className="text-xs text-gray-500 ml-auto">Score: {category.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wheel;
