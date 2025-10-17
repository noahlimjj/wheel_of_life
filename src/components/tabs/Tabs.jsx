import React from 'react';

const Tabs = ({ activeTab, onTabClick }) => {
  const tabs = ['wheel', 'list', 'calendar', 'draw'];

  return (
    <nav className="flex space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
            activeTab === tab
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
