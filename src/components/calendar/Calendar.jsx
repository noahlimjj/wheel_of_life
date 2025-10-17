import React from 'react';

const Calendar = ({ currentDate, events, categories, onNavigate, onOpenEventModal, onSetView }) => {
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayElements = [];
    
    daysOfWeek.forEach(day => {
      dayElements.push(
        <div key={`header-${day}`} className="text-center font-semibold py-2 bg-gray-100">
          {day}
        </div>
      );
    });
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      dayElements.push(renderCalendarDay(day, true, date));
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayElement = renderCalendarDay(day, false, date);
      
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        dayElement.props.className += ' bg-blue-50';
      }
      
      dayElements.push(dayElement);
    }
    
    const totalCells = dayElements.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      dayElements.push(renderCalendarDay(day, true, date));
    }
    
    return dayElements;
  };

  const renderCalendarDay = (dayNumber, isOtherMonth, date) => {
    const dayEvents = getEventsForDate(date);
    
    return (
      <div 
        key={`${date.getMonth()}-${date.getDate()}`}
        className={`p-1 border border-gray-200 min-h-20 cursor-pointer hover:bg-gray-50 ${isOtherMonth ? 'opacity-40' : ''}`}
        onClick={() => onOpenEventModal(date)}
      >
        <div className="text-right font-medium pr-1">{dayNumber}</div>
        <div className="mt-1 space-y-1">
          {dayEvents.slice(0, 2).map((event, idx) => (
            <div 
              key={idx} 
              className="text-xs p-1 rounded truncate"
              style={{ backgroundColor: getCategoryColor(event.category) + '40', borderLeft: `3px solid ${getCategoryColor(event.category)}` }}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
          )}
        </div>
      </div>
    );
  };

  const getEventsForDate = (date) => {
    const dateString = date.toDateString();
    return events.filter(event => 
      new Date(event.date).toDateString() === dateString
    );
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#ccc';
  };

  const monthName = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('prev')}
              className="p-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              &larr;
            </button>
            <span className="text-lg font-medium px-4">{monthName}</span>
            <button 
              onClick={() => onNavigate('next')}
              className="p-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              &rarr;
            </button>
          </div>
          
          <div className="flex border border-gray-300 rounded overflow-hidden">
            {['month', 'week'].map((view) => (
              <button
                key={view}
                className={`px-3 py-1 text-sm ${
                  'month' === view
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSetView(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar;
