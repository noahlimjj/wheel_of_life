import React from 'react';

const Wheel = ({ categories, onCategoryClick }) => {
  const renderWheel = () => {
    const angleStep = (2 * Math.PI) / categories.length;
    const centerX = 200;
    const centerY = 200;
    const radius = 150;

    return categories.map((category, index) => {
      const startAngle = index * angleStep - Math.PI / 2;
      const endAngle = (index + 1) * angleStep - Math.PI / 2;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = angleStep > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Calculate text position
      const textAngle = startAngle + angleStep / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);

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
      <h2 className="text-xl font-semibold mb-2">Life Balance Wheel</h2>
      <p className="mb-6 text-gray-600">Click on segments to focus on specific areas of your life.</p>
      
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wheel;
