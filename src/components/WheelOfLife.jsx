import React, { useState, useEffect } from 'react';
import Wheel from './wheel/Wheel';
import CategoriesGrid from './categories/CategoriesGrid';
import Calendar from './calendar/Calendar';
import EventModal from './calendar/EventModal';
import DrawingBoard from './drawing/DrawingBoard';
import Tabs from './tabs/Tabs';

export default function WheelOfLife() {
  const [activeTab, setActiveTab] = useState('wheel');
  const [appState, setAppState] = useState({
    categories: [
      { name: 'Medical School', color: '#A8D8EA', goals: [] },
      { name: 'Jiu-Jitsu', color: '#FFB6B9', goals: [] },
      { name: 'Research', color: '#C7CEEA', goals: [] },
      { name: 'Health & Fitness', color: '#B8E6B8', goals: [] },
      { name: 'Relationships', color: '#FFDCE5', goals: [] },
      { name: 'Faith & Character', color: '#FFE5B4', goals: [] },
      { name: 'Finance', color: '#B5EAD7', goals: [] },
      { name: 'Personal Growth', color: '#FFDAB9', goals: [] }
    ],
    events: [],
    currentDate: new Date(2025, 9, 17), // October 17, 2025
    calendarView: 'month',
  });
  
  const [eventModal, setEventModal] = useState({ show: false, date: null });
  const [newEventDate, setNewEventDate] = useState(null);

  useEffect(() => {
    const updatedCategories = [...appState.categories];
    
    updatedCategories[0].goals = [
      { text: 'Complete OSCE preparation', completed: false, createdAt: new Date() },
      { text: 'Study for Step 1 exam', completed: false, createdAt: new Date() }
    ];
    
    updatedCategories[1].goals = [
      { text: 'Practice 3x per week', completed: true, createdAt: new Date() },
      { text: 'Learn new submission technique', completed: false, createdAt: new Date() }
    ];
    
    updatedCategories[3].goals = [
      { text: 'Hit the gym 5x per week', completed: false, createdAt: new Date() },
      { text: 'Track daily nutrition', completed: true, createdAt: new Date() }
    ];

    const sampleEvents = [
      {
        id: 1,
        title: 'Jiu-Jitsu Training',
        category: 'Jiu-Jitsu',
        description: 'Evening training session',
        date: new Date(2025, 9, 18).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Study Session',
        category: 'Medical School',
        description: 'Cardiology review',
        date: new Date(2025, 9, 19).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    setAppState(prev => ({
      ...prev,
      categories: updatedCategories,
      events: sampleEvents
    }));
  }, []);

  const focusCategory = (categoryName) => {
    setActiveTab('list');
    const categoryIndex = appState.categories.findIndex(cat => cat.name === categoryName);
    if (categoryIndex !== -1) {
      // setSelectedCategoryIndex(categoryIndex);
    }
  };

  const addGoal = (categoryIndex, newGoalText) => {
    const updatedCategories = [...appState.categories];
    updatedCategories[categoryIndex].goals.push({
      text: newGoalText.trim(),
      completed: false,
      createdAt: new Date()
    });
    
    setAppState(prev => ({ ...prev, categories: updatedCategories }));
  };

  const toggleGoal = (categoryIndex, goalIndex) => {
    const updatedCategories = [...appState.categories];
    updatedCategories[categoryIndex].goals[goalIndex].completed = 
      !updatedCategories[categoryIndex].goals[goalIndex].completed;
    
    setAppState(prev => ({ ...prev, categories: updatedCategories }));
  };

  const openEventModal = (date) => {
    setNewEventDate(date);
    setEventModal({ show: true, date });
  };

  const closeEventModal = () => {
    setEventModal({ show: false, date: null });
  };

  const saveEvent = (eventFormData) => {
    const newEvent = {
      id: Date.now(),
      title: eventFormData.title,
      category: eventFormData.category,
      description: eventFormData.description,
      date: newEventDate.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setAppState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    
    closeEventModal();
  };

  const navigateCalendar = (direction) => {
    setAppState(prev => {
      const newDate = new Date(prev.currentDate);
      if (prev.calendarView === 'month') {
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      } else {
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      }
      return { ...prev, currentDate: newDate };
    });
  };

  const setCalendarView = (view) => {
    setAppState(prev => ({ ...prev, calendarView: view }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Wheel of Life - Goals Dashboard</h1>
        <Tabs activeTab={activeTab} onTabClick={setActiveTab} />
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'wheel' && (
          <Wheel categories={appState.categories} onCategoryClick={focusCategory} />
        )}

        {activeTab === 'list' && (
          <CategoriesGrid 
            categories={appState.categories} 
            onAddGoal={addGoal} 
            onToggleGoal={toggleGoal} 
          />
        )}

        {activeTab === 'calendar' && (
          <Calendar 
            currentDate={appState.currentDate} 
            events={appState.events} 
            categories={appState.categories}
            onNavigate={navigateCalendar} 
            onOpenEventModal={openEventModal}
            onSetView={setCalendarView}
          />
        )}

        {activeTab === 'draw' && (
          <DrawingBoard />
        )}
      </main>

      {eventModal.show && (
        <EventModal 
          categories={appState.categories} 
          onSave={saveEvent} 
          onClose={closeEventModal} 
          date={eventModal.date} 
        />
      )}
    </div>
  );
}