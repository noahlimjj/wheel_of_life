// --- Data Persistence ---
        function saveStateToLocalStorage() {
            localStorage.setItem('wheelOfLifeState', JSON.stringify(appState));
        }

        function loadStateFromLocalStorage() {
            const savedState = localStorage.getItem('wheelOfLifeState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Revive date objects from string representations
                parsedState.currentDate = new Date(parsedState.currentDate);
                if (parsedState.events) {
                    parsedState.events.forEach(event => {
                        event.date = new Date(event.date);
                        event.createdAt = new Date(event.createdAt);
                    });
                }
                if (parsedState.categories) {
                    parsedState.categories.forEach(category => {
                        if (category.goals) {
                            category.goals.forEach(goal => {
                                goal.createdAt = new Date(goal.createdAt);
                            });
                        }
                    });
                }
                return parsedState;
            }
            return null;
        }

        // --- Application State ---
        const initialState = {
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
            currentTool: 'pen',
            brushSize: 2,
            drawingHistory: [],
            historyStep: -1
        };

        let appState = loadStateFromLocalStorage() || initialState;
        let editingCategoryIndex = null;

        // --- Initialization ---
        document.addEventListener('DOMContentLoaded', function() {
            initializeTabs();
            renderWheel();
            renderLegend();
            renderCategoriesGrid();
            renderCalendar();
            initializeDrawing();
            populateEventCategorySelect();

            // Add sample data only if the state is new
            if (!localStorage.getItem('wheelOfLifeState')) {
                addSampleGoals();
            }

            document.getElementById('clearDataBtn').addEventListener('click', function() {
                if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
                    localStorage.removeItem('wheelOfLifeState');
                    appState = JSON.parse(JSON.stringify(initialState)); // Deep copy
                    // Re-render the entire application
                    renderWheel();
                    renderLegend();
                    renderCategoriesGrid();
                    renderCalendar();
                    clearCanvas(); // Clear the drawing canvas
                    appState.drawingHistory = []; // Reset drawing history
                    appState.historyStep = -1;
                    saveState(); // Save the cleared drawing state
                    populateEventCategorySelect();
                }
            });

            document.getElementById('closeCategoryEditModal').addEventListener('click', closeCategoryEditModal);
            document.getElementById('closeAddCategoryModal').addEventListener('click', closeAddCategoryModal);

            document.getElementById('categoryEditForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const newName = document.getElementById('editCategoryName').value;
                const newColor = document.getElementById('editCategoryColor').value;

                if (editingCategoryIndex !== null) {
                    appState.categories[editingCategoryIndex].name = newName;
                    appState.categories[editingCategoryIndex].color = newColor;
                    
                    saveStateToLocalStorage();
                    renderCategoriesGrid();
                    renderWheel();
                    renderLegend();
                    populateEventCategorySelect();
                    closeCategoryEditModal();
                }
            });

            document.getElementById('addCategoryForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('newCategoryName').value;
                const color = document.getElementById('newCategoryColor').value;

                if (name.trim()) {
                    appState.categories.push({ name: name.trim(), color: color, goals: [] });
                    saveStateToLocalStorage();
                    renderCategoriesGrid();
                    renderWheel();
                    renderLegend();
                    populateEventCategorySelect();
                    closeAddCategoryModal();
                    document.getElementById('newCategoryName').value = '';
                    document.getElementById('newCategoryColor').value = '#A8D8EA';
                }
            });

            document.getElementById('deleteCategoryBtn').addEventListener('click', function() {
                if (editingCategoryIndex !== null) {
                    if (confirm('Are you sure you want to delete this category? This will also delete all the goals in this category.')) {
                        appState.categories.splice(editingCategoryIndex, 1);
                        saveStateToLocalStorage();
                        renderCategoriesGrid();
                        renderWheel();
                        renderLegend();
                        populateEventCategorySelect();
                        closeCategoryEditModal();
                    }
                }
            });

            // Hide loader and show app
            document.querySelector('.loader-container').style.display = 'none';
            document.querySelector('.app').style.display = 'flex';
        });

        // --- Tab Management ---
        function initializeTabs() {
            const tabs = document.querySelectorAll('.nav-tab');
            const tabContents = document.querySelectorAll('.tab-content');

            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.dataset.tab;
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById(tabId + '-tab').classList.add('active');
                    
                    if (tabId === 'calendar') {
                        renderCalendar();
                    } else if (tabId === 'draw') {
                        resizeCanvas();
                    }
                });
            });
        }

        // --- Wheel Visualization ---
        function renderWheel() {
            const svg = document.querySelector('.wheel-svg');
            const centerX = 200;
            const centerY = 200;
            const radius = 150;
            const categories = appState.categories;
            const angleStep = (2 * Math.PI) / categories.length;

            svg.innerHTML = '';

            categories.forEach((category, index) => {
                const startAngle = index * angleStep - Math.PI / 2;
                const endAngle = (index + 1) * angleStep - Math.PI / 2;
                
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const largeArcFlag = angleStep > Math.PI ? 1 : 0;
                
                const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', category.color);
                path.setAttribute('stroke', 'white');
                path.setAttribute('stroke-width', '2');
                path.classList.add('wheel-segment');
                path.setAttribute('data-category', category.name);
                
                path.addEventListener('click', () => focusCategory(category.name));
                
                svg.appendChild(path);
                
                const textAngle = startAngle + angleStep / 2;
                const textRadius = radius * 0.7;
                const textX = centerX + textRadius * Math.cos(textAngle);
                const textY = centerY + textRadius * Math.sin(textAngle);
                
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', textX);
                text.setAttribute('y', textY);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('font-size', '12');
                text.setAttribute('font-weight', '600');
                text.setAttribute('fill', '#333');
                text.style.pointerEvents = 'none';
                
                const words = category.name.split(' ');
                if (words.length > 1) {
                    words.forEach((word, wordIndex) => {
                        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                        tspan.setAttribute('x', textX);
                        tspan.setAttribute('dy', wordIndex === 0 ? '0' : '14');
                        tspan.textContent = word;
                        text.appendChild(tspan);
                    });
                } else {
                    text.textContent = category.name;
                }
                
                svg.appendChild(text);
            });
        }

        // --- Legend ---
        function renderLegend() {
            const legend = document.querySelector('.wheel-legend');
            legend.innerHTML = '';
            
            appState.categories.forEach(category => {
                const item = document.createElement('div');
                item.classList.add('legend-item');
                
                const color = document.createElement('div');
                color.classList.add('legend-color');
                color.style.backgroundColor = category.color;
                
                const text = document.createElement('div');
                text.classList.add('legend-text');
                text.textContent = category.name;
                
                item.appendChild(color);
                item.appendChild(text);
                legend.appendChild(item);
            });
        }

        // --- Categories & Goals ---
        function renderCategoriesGrid() {
            const grid = document.querySelector('.categories-grid');
            grid.innerHTML = '';
            let draggedIndex = null;

            appState.categories.forEach((category, categoryIndex) => {
                const card = document.createElement('div');
                card.classList.add('category-card');
                card.setAttribute('draggable', 'true');
                card.setAttribute('data-index', categoryIndex);

                // Drag and drop event listeners
                card.addEventListener('dragstart', (e) => {
                    draggedIndex = categoryIndex;
                    e.dataTransfer.effectAllowed = 'move';
                    e.target.classList.add('dragging');
                });

                card.addEventListener('dragend', (e) => {
                    e.target.classList.remove('dragging');
                });

                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const afterElement = getDragAfterElement(grid, e.clientY);
                    const draggedElement = document.querySelector('.dragging');
                    if (afterElement == null) {
                        grid.appendChild(draggedElement);
                    } else {
                        grid.insertBefore(draggedElement, afterElement);
                    }
                });

                card.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const fromIndex = draggedIndex;
                    const toIndex = Array.from(grid.children).indexOf(e.target.closest('.category-card'));

                    if (fromIndex !== toIndex) {
                        const movedItem = appState.categories.splice(fromIndex, 1)[0];
                        appState.categories.splice(toIndex, 0, movedItem);
                        saveStateToLocalStorage();
                        renderCategoriesGrid(); // Re-render to update indexes
                    }
                });
                
                const header = document.createElement('div');
                header.classList.add('category-header');
                
                const colorIndicator = document.createElement('div');
                colorIndicator.classList.add('category-color');
                colorIndicator.style.backgroundColor = category.color;
                
                const name = document.createElement('div');
                name.classList.add('category-name');
                name.textContent = category.name;

                const editBtn = document.createElement('button');
                editBtn.classList.add('btn', 'btn--sm', 'btn--outline');
                editBtn.innerHTML = '✏️';
                editBtn.addEventListener('click', () => openCategoryEditModal(categoryIndex));

                const headerContent = document.createElement('div');
                headerContent.style.display = 'flex';
                headerContent.style.alignItems = 'center';
                headerContent.style.gap = '8px';
                headerContent.appendChild(colorIndicator);
                headerContent.appendChild(name);

                header.appendChild(headerContent);
                header.appendChild(editBtn);
                
                const goalsList = document.createElement('ul');
                goalsList.classList.add('goals-list');
                
                if (category.goals) {
                    category.goals.forEach((goal, goalIndex) => {
                        const goalItem = createGoalItem(goal, categoryIndex, goalIndex);
                        goalsList.appendChild(goalItem);
                    });
                }
                
                const addForm = document.createElement('div');
                addForm.classList.add('add-goal-form');
                
                const input = document.createElement('input');
                input.classList.add('add-goal-input');
                input.type = 'text';
                input.placeholder = 'Add a new goal...';
                
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && this.value.trim()) {
                        addGoal(categoryIndex, this.value.trim());
                        this.value = '';
                    }
                });
                
                addForm.appendChild(input);
                
                card.appendChild(header);
                card.appendChild(goalsList);
                card.appendChild(addForm);
                
                grid.appendChild(card);
            });

            const addCategoryCard = document.createElement('div');
            addCategoryCard.classList.add('category-card', 'add-category-card');
            addCategoryCard.innerHTML = `
                <div class="add-category-card-content">
                    <span>+</span>
                    <p>Add Category</p>
                </div>
            `;
            addCategoryCard.addEventListener('click', openAddCategoryModal);
            grid.appendChild(addCategoryCard);
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.category-card:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function createGoalItem(goal, categoryIndex, goalIndex) {
            const item = document.createElement('li');
            item.classList.add('goal-item');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('goal-checkbox');
            checkbox.checked = goal.completed;
            
            const text = document.createElement('span');
            text.classList.add('goal-text');
            if (goal.completed) {
                text.classList.add('completed');
            }
            text.textContent = goal.text;

            const editBtn = document.createElement('button');
            editBtn.classList.add('btn', 'btn--sm', 'btn--outline');
            editBtn.innerHTML = '✏️';

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn--sm', 'btn--outline');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.addEventListener('click', () => deleteGoal(categoryIndex, goalIndex));
            
            checkbox.addEventListener('change', () => toggleGoal(categoryIndex, goalIndex));

            editBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = text.textContent;
                input.classList.add('goal-edit-input');
                item.replaceChild(input, text);
                input.focus();

                const saveBtn = document.createElement('button');
                saveBtn.classList.add('btn', 'btn--sm', 'btn--primary');
                saveBtn.innerHTML = 'Save';

                item.replaceChild(saveBtn, editBtn);

                saveBtn.addEventListener('click', () => {
                    const newText = input.value;
                    if (newText.trim()) {
                        appState.categories[categoryIndex].goals[goalIndex].text = newText.trim();
                        saveStateToLocalStorage();
                        renderCategoriesGrid();
                    }
                });
            });
            
            item.appendChild(checkbox);
            item.appendChild(text);
            item.appendChild(editBtn);
            item.appendChild(deleteBtn);
            
            return item;
        }

        function deleteGoal(categoryIndex, goalIndex) {
            if (confirm('Are you sure you want to delete this goal?')) {
                appState.categories[categoryIndex].goals.splice(goalIndex, 1);
                saveStateToLocalStorage();
                renderCategoriesGrid();
            }
        }

        function addGoal(categoryIndex, goalText) {
            if (!appState.categories[categoryIndex].goals) {
                appState.categories[categoryIndex].goals = [];
            }
            appState.categories[categoryIndex].goals.push({
                text: goalText,
                completed: false,
                createdAt: new Date()
            });
            renderCategoriesGrid();
            saveStateToLocalStorage();
        }

        function toggleGoal(categoryIndex, goalIndex) {
            appState.categories[categoryIndex].goals[goalIndex].completed = 
                !appState.categories[categoryIndex].goals[goalIndex].completed;
            renderCategoriesGrid();
            saveStateToLocalStorage();
        }

        function focusCategory(categoryName) {
            const tabs = document.querySelectorAll('.nav-tab');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="list"]').classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById('list-tab').classList.add('active');
        }

        // --- Calendar ---
        function renderCalendar() {
            const grid = document.getElementById('calendarGrid');
            const title = document.getElementById('calendarTitle');
            
            if (appState.calendarView === 'month') {
                renderMonthView(grid, title);
            } else {
                renderWeekView(grid, title);
            }
        }

        function renderMonthView(grid, title) {
            const currentDate = new Date(appState.currentDate);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            title.textContent = new Date(year, month).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            
            grid.innerHTML = '';
            
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            daysOfWeek.forEach(day => {
                const header = document.createElement('div');
                header.classList.add('calendar-header');
                header.textContent = day;
                grid.appendChild(header);
            });
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const dayElement = createCalendarDay(day, true, new Date(year, month - 1, day));
                grid.appendChild(dayElement);
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayElement = createCalendarDay(day, false, date);
                
                const today = new Date();
                if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                grid.appendChild(dayElement);
            }
            
            const totalCells = grid.children.length - 7;
            const remainingCells = (totalCells > 35 ? 42 : 35) - totalCells;
            for (let day = 1; day <= remainingCells; day++) {
                const dayElement = createCalendarDay(day, true, new Date(year, month + 1, day));
                grid.appendChild(dayElement);
            }
        }

        function createCalendarDay(dayNumber, isOtherMonth, date) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            if (isOtherMonth) {
                dayElement.classList.add('other-month');
            }
            
            const dayNumberSpan = document.createElement('div');
            dayNumberSpan.classList.add('day-number');
            dayNumberSpan.textContent = dayNumber;
            
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('day-events');
            
            const dayEvents = getEventsForDate(date);
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.style.display = 'flex';
                eventElement.style.alignItems = 'center';
                eventElement.style.gap = '4px';
                
                const dot = document.createElement('div');
                dot.classList.add('event-dot');
                dot.style.backgroundColor = getCategoryColor(event.category);
                
                const text = document.createElement('div');
                text.classList.add('event-text');
                text.textContent = event.title;
                
                eventElement.appendChild(dot);
                eventElement.appendChild(text);
                eventsContainer.appendChild(eventElement);
            });
            
            dayElement.appendChild(dayNumberSpan);
            dayElement.appendChild(eventsContainer);
            
            dayElement.addEventListener('click', () => openEventModal(date));
            
            return dayElement;
        }

        function renderWeekView(grid, title) {
            const startOfWeek = getStartOfWeek(new Date(appState.currentDate));
            
            title.textContent = `Week of ${startOfWeek.toLocaleDateString()}`;
            
            grid.innerHTML = '';
            grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                
                const dayElement = createCalendarDay(date.getDate(), false, date);
                dayElement.style.minHeight = '120px';
                
                const today = new Date();
                if (date.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                grid.appendChild(dayElement);
            }
        }

        function getStartOfWeek(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day;
            return new Date(d.setDate(diff));
        }

        function getEventsForDate(date) {
            const dateString = date.toDateString();
            return appState.events.filter(event => 
                new Date(event.date).toDateString() === dateString
            );
        }

        function getCategoryColor(categoryName) {
            const category = appState.categories.find(cat => cat.name === categoryName);
            return category ? category.color : '#ccc';
        }

        document.getElementById('prevMonth').addEventListener('click', function() {
            const newDate = new Date(appState.currentDate);
            if (appState.calendarView === 'month') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setDate(newDate.getDate() - 7);
            }
            appState.currentDate = newDate;
            renderCalendar();
            saveStateToLocalStorage();
        });

        document.getElementById('nextMonth').addEventListener('click', function() {
            const newDate = new Date(appState.currentDate);
            if (appState.calendarView === 'month') {
                newDate.setMonth(newDate.getMonth() + 1);
            } else {
                newDate.setDate(newDate.getDate() + 7);
            }
            appState.currentDate = newDate;
            renderCalendar();
            saveStateToLocalStorage();
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                appState.calendarView = this.dataset.view;
                renderCalendar();
                saveStateToLocalStorage();
            });
        });

        // --- Event Modal ---
        let currentEventDate = null;
        let currentEventId = null;

        function openEventModal(date) {
            currentEventDate = date;
            currentEventId = null;
            
            const modal = document.getElementById('eventModal');
            const title = document.getElementById('modalTitle');
            const form = document.getElementById('eventForm');
            
            title.textContent = `Add Event - ${date.toLocaleDateString()}`;
            form.reset();
            document.getElementById('eventActions').style.display = 'none';
            
            modal.classList.add('show');
        }

        function closeEventModal() {
            document.getElementById('eventModal').classList.remove('show');
        }

        // --- Category Modals ---
        function openCategoryEditModal(categoryIndex) {
            editingCategoryIndex = categoryIndex;
            const category = appState.categories[categoryIndex];

            document.getElementById('editCategoryName').value = category.name;
            document.getElementById('editCategoryColor').value = category.color;

            document.getElementById('categoryEditModal').classList.add('show');
        }

        function closeCategoryEditModal() {
            document.getElementById('categoryEditModal').classList.remove('show');
            editingCategoryIndex = null;
        }

        function openAddCategoryModal() {
            document.getElementById('addCategoryModal').classList.add('show');
        }

        function closeAddCategoryModal() {
            document.getElementById('addCategoryModal').classList.remove('show');
        }

        function populateEventCategorySelect() {
            const select = document.getElementById('eventCategory');
            select.innerHTML = '';
            
            appState.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }

        document.getElementById('closeModal').addEventListener('click', closeEventModal);
        
        document.getElementById('eventModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeEventModal();
            }
        });

        document.getElementById('eventForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('eventTitle').value;
            const category = document.getElementById('eventCategory').value;
            const description = document.getElementById('eventDescription').value;
            
            if (currentEventId) {
                const eventIndex = appState.events.findIndex(e => e.id === currentEventId);
                if (eventIndex !== -1) {
                    appState.events[eventIndex] = {
                        ...appState.events[eventIndex],
                        title,
                        category,
                        description
                    };
                }
            } else {
                appState.events.push({
                    id: Date.now(),
                    title,
                    category,
                    description,
                    date: currentEventDate,
                    createdAt: new Date()
                });
            }
            
            renderCalendar();
            closeEventModal();
            saveStateToLocalStorage();
        });

        // --- Drawing ---
        let canvas, ctx;
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        function initializeDrawing() {
            canvas = document.getElementById('drawingCanvas');
            ctx = canvas.getContext('2d');
            
            resizeCanvas();
            
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            canvas.addEventListener('touchstart', handleTouch);
            canvas.addEventListener('touchmove', handleTouch);
            canvas.addEventListener('touchend', stopDrawing);
            
            document.querySelectorAll('[data-tool]').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    appState.currentTool = this.dataset.tool;
                    saveStateToLocalStorage();
                });
            });
            
            const sizeSlider = document.getElementById('brushSize');
            const sizeDisplay = document.getElementById('sizeDisplay');
            
            sizeSlider.addEventListener('input', function() {
                appState.brushSize = parseInt(this.value);
                sizeDisplay.textContent = this.value + 'px';
                saveStateToLocalStorage();
            });
            
            document.getElementById('undoBtn').addEventListener('click', undo);
            document.getElementById('redoBtn').addEventListener('click', redo);
            document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
            
            if (appState.drawingHistory.length === 0) {
                saveState();
            } else {
                restoreState(appState.drawingHistory[appState.historyStep]);
            }
        }

        function resizeCanvas() {
            if (!canvas) return;
            
            const container = canvas.parentElement;
            const rect = container.getBoundingClientRect();
            
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            
            const aspectRatio = 800 / 600;
            const containerWidth = rect.width;
            const containerHeight = containerWidth / aspectRatio;
            
            canvas.width = 800;
            canvas.height = 600;
            canvas.style.height = containerHeight + 'px';
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (appState.drawingHistory.length > 0) {
                restoreState(appState.drawingHistory[appState.historyStep]);
            }
        }

        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = getMousePos(e);
        }

        function draw(e) {
            if (!isDrawing) return;
            
            const [currentX, currentY] = getMousePos(e);
            
            ctx.globalCompositeOperation = appState.currentTool === 'eraser' ? 'destination-out' : 'source-over';
            
            switch (appState.currentTool) {
                case 'pen':
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = appState.brushSize;
                    ctx.globalAlpha = 1;
                    break;
                case 'marker':
                    ctx.strokeStyle = '#666666';
                    ctx.lineWidth = appState.brushSize * 2;
                    ctx.globalAlpha = 0.7;
                    break;
                case 'highlight':
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = appState.brushSize * 3;
                    ctx.globalAlpha = 0.3;
                    break;
                case 'eraser':
                    ctx.lineWidth = appState.brushSize * 2;
                    break;
            }
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            [lastX, lastY] = [currentX, currentY];
        }

        function stopDrawing() {
            if (!isDrawing) return;
            isDrawing = false;
            saveState();
        }

        function handleTouch(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            return [
                (e.clientX - rect.left) * scaleX,
                (e.clientY - rect.top) * scaleY
            ];
        }

        function saveState() {
            appState.historyStep++;
            if (appState.historyStep < appState.drawingHistory.length) {
                appState.drawingHistory.length = appState.historyStep;
            }
            appState.drawingHistory.push(canvas.toDataURL());
            
            if (appState.drawingHistory.length > 20) {
                appState.drawingHistory.shift();
                appState.historyStep--;
            }
            saveStateToLocalStorage();
        }

        function undo() {
            if (appState.historyStep > 0) {
                appState.historyStep--;
                restoreState(appState.drawingHistory[appState.historyStep]);
                saveStateToLocalStorage();
            }
        }

        function redo() {
            if (appState.historyStep < appState.drawingHistory.length - 1) {
                appState.historyStep++;
                restoreState(appState.drawingHistory[appState.historyStep]);
                saveStateToLocalStorage();
            }
        }

        function restoreState(dataURL) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataURL;
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveState();
        }

        // --- Sample Data ---
        function addSampleGoals() {
            appState.categories[0].goals.push(
                { text: 'Complete OSCE preparation', completed: false, createdAt: new Date() },
                { text: 'Study for Step 1 exam', completed: false, createdAt: new Date() }
            );
            
            appState.categories[1].goals.push(
                { text: 'Practice 3x per week', completed: true, createdAt: new Date() },
                { text: 'Learn new submission technique', completed: false, createdAt: new Date() }
            );
            
            appState.categories[3].goals.push(
                { text: 'Hit the gym 5x per week', completed: false, createdAt: new Date() },
                { text: 'Track daily nutrition', completed: true, createdAt: new Date() }
            );
            
            appState.events.push(
                {
                    id: 1,
                    title: 'Jiu-Jitsu Training',
                    category: 'Jiu-Jitsu',
                    description: 'Evening training session',
                    date: new Date(2025, 9, 18),
                    createdAt: new Date()
                },
                {
                    id: 2,
                    title: 'Study Session',
                    category: 'Medical School',
                    description: 'Cardiology review',
                    date: new Date(2025, 9, 19),
                    createdAt: new Date()
                }
            );
            saveStateToLocalStorage();
        }

        // --- Global Event Listeners ---
        window.addEventListener('resize', resizeCanvas);
