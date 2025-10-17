import React, { useState } from 'react';

const GoalList = ({ category, onAddGoal, onToggleGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');

  const addGoal = () => {
    if (newGoalText.trim()) {
      onAddGoal(newGoalText);
      setNewGoalText('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-sm flex-shrink-0" 
          style={{ backgroundColor: category.color }}
        ></div>
        <h3 className="font-semibold text-lg">{category.name}</h3>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {category.goals.map((goal, goalIndex) => (
          <li key={goalIndex} className="p-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => onToggleGoal(goalIndex)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`flex-1 ${goal.completed ? 'line-through text-gray-500' : ''}`}>
              {goal.text}
            </span>
          </li>
        ))}
        
        {category.goals.length === 0 && (
          <li className="p-4 text-center text-gray-500 italic">No goals yet</li>
        )}
      </ul>
      
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Add a new goal..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addGoal();
              }
            }}
          />
          <button
            onClick={addGoal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalList;
