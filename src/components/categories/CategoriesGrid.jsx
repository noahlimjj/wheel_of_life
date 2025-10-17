import React from 'react';
import GoalList from '../goals/GoalList';

const CategoriesGrid = ({ categories, onAddGoal, onToggleGoal }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Goals by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, categoryIndex) => (
          <GoalList 
            key={categoryIndex} 
            category={category} 
            onAddGoal={(newGoalText) => onAddGoal(categoryIndex, newGoalText)} 
            onToggleGoal={(goalIndex) => onToggleGoal(categoryIndex, goalIndex)} 
          />
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;
