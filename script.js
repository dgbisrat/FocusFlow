// ==================== DATA WITH LOCALSTORAGE ====================

// Default tasks data
const defaultTasks = [
  { id: 1, name: 'Biology Chapter 5', category: 'study', priority: 'high', duration: 90, status: 'todo', due: 'Due Tomorrow', subtasks: [{name:'Read the chapter',done:true},{name:'Make notes',done:false},{name:'Solve MCQs',done:false},{name:'Review diagrams',done:false}] },
  { id: 2, name: 'Math Problem Set', category: 'study', priority: 'medium', duration: 60, status: 'todo', due: 'Due in 2 days', subtasks: [] },
  { id: 3, name: 'React Project', category: 'work', priority: 'medium', duration: 120, status: 'inprogress', due: 'Due in 3 days', subtasks: [] },
  { id: 4, name: 'English Essay', category: 'study', priority: 'low', duration: 45, status: 'todo', due: 'Due in 1 week', subtasks: [] },
  { id: 5, name: 'Gym Workout', category: 'health', priority: 'low', duration: 60, status: 'todo', due: 'Due in 1 day', subtasks: [] },
  { id: 6, name: 'Read a Book', category: 'personal', priority: 'low', duration: 30, status: 'todo', due: 'No due date', subtasks: [] },
  { id: 7, name: 'Learn Node.js', category: 'work', priority: 'medium', duration: 90, status: 'todo', due: 'No due date', subtasks: [] },
  { id: 8, name: 'Buy Groceries', category: 'personal', priority: 'low', duration: 30, status: 'todo', due: 'No due date', subtasks: [] }
];

// Load or initialize tasks from localStorage
let tasks = [];
let currentTaskFilter = 'all';
let currentViewingTask = null;

// Timer variables
let timerInterval = null;
let timerRunning = false;
let timerSeconds = 25 * 60;
let timerTotalSeconds = 25 * 60;
let timerMode = 'focus';
let completedSessions = 0;
let totalSessions = 8;

// Settings variables
let settings = {
  theme: 'light',
  focusTime: 25,
  breakTime: 5,
  soundEnabled: true,
  remindersEnabled: true,
  dailyGoal: 8
};

// ==================== LOCALSTORAGE FUNCTIONS ====================

function saveTasksToLocalStorage() {
  localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const savedTasks = localStorage.getItem('focusflow_tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    tasks = JSON.parse(JSON.stringify(defaultTasks));
    saveTasksToLocalStorage();
  }
}

function saveTimerToLocalStorage() {
  const timerData = {
    completedSessions: completedSessions,
    totalSessions: totalSessions,
    timerMode: timerMode
  };
  localStorage.setItem('focusflow_timer', JSON.stringify(timerData));
}

function loadTimerFromLocalStorage() {
  const savedTimer = localStorage.getItem('focusflow_timer');
  if (savedTimer) {
    const timerData = JSON.parse(savedTimer);
    completedSessions = timerData.completedSessions;
    totalSessions = timerData.totalSessions;
    timerMode = timerData.timerMode;
  }
}

function saveSettingsToLocalStorage() {
  localStorage.setItem('focusflow_settings', JSON.stringify(settings));
}

function loadSettingsFromLocalStorage() {
  const savedSettings = localStorage.getItem('focusflow_settings');
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
    // Apply loaded settings
    document.querySelectorAll('.settings-select').forEach(select => {
      const settingName = select.closest('.settings-row')?.querySelector('.settings-row-label')?.innerText;
      if (settingName === 'Theme') select.value = settings.theme;
      if (settingName === 'Default Focus Time') select.value = settings.focusTime + ' minutes';
      if (settingName === 'Default Break Time') select.value = settings.breakTime + ' minutes';
      if (settingName === 'Daily focus goal') select.value = settings.dailyGoal + ' hours';
    });
    
    const soundToggle = document.querySelectorAll('.settings-section .toggle-switch')[0];
    if (soundToggle && !settings.soundEnabled) soundToggle.classList.remove('on');
    
    const reminderToggle = document.querySelectorAll('.settings-section .toggle-switch')[1];
    if (reminderToggle && !settings.remindersEnabled) reminderToggle.classList.remove('on');
  }
}

function saveAllData() {
  saveTasksToLocalStorage();
  saveTimerToLocalStorage();
  saveSettingsToLocalStorage();
}

// ==================== AUTH ====================
function showPage(page) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('signupPage').classList.add('hidden');
  document.getElementById('appLayout').classList.add('hidden');
  if (page === 'login') document.getElementById('loginPage').classList.remove('hidden');
  else if (page === 'signup') document.getElementById('signupPage').classList.remove('hidden');
  else {
    document.getElementById('appLayout').classList.remove('hidden');
    loadAllData();
    renderTasks();
    renderWeekGrid();
    renderBarChart();
    renderSessionDots();
    updateTimerDisplay();
    applySettings();
  }
}

function loadAllData() {
  loadTasksFromLocalStorage();
  loadTimerFromLocalStorage();
  loadSettingsFromLocalStorage();
}

function handleLogin(e) {
  e.preventDefault();
  showPage('app');
}

function handleSignup(e) {
  e.preventDefault();
  showPage('app');
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function applySettings() {
  // Apply theme
  if (settings.theme === 'dark') {
    document.body.style.background = '#1a1a2e';
    document.body.style.color = '#ffffff';
  } else {
    document.body.style.background = '#f5f3ff';
    document.body.style.color = '#1e1b4b';
  }
  
  // Apply timer settings
  if (timerMode === 'focus') {
    timerTotalSeconds = settings.focusTime * 60;
    timerSeconds = timerTotalSeconds;
    updateTimerDisplay();
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(page + 'Page');
  if (targetPage) targetPage.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  
  if (page === 'tasks') renderTasks();
  if (page === 'schedule') renderWeekGrid();
  if (page === 'timer') renderSessionDots();
  if (page === 'analytics') renderBarChart();
  if (page === 'taskDetails' && currentViewingTask) renderSubtasks();
}

// ==================== TASKS WITH LOCALSTORAGE ====================
function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
  
  let filtered = tasks;
  if (currentTaskFilter === 'todo') filtered = tasks.filter(t => t.status === 'todo');
  else if (currentTaskFilter === 'inprogress') filtered = tasks.filter(t => t.status === 'inprogress');
  else if (currentTaskFilter === 'completed') filtered = tasks.filter(t => t.status === 'completed');
  
  if (filtered.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">No tasks found. Click "Add Task" to create one!</div>';
    return;
  }
  
  list.innerHTML = filtered.map(t => `
    <div class="task-item" onclick="viewTaskDetails(${t.id})">
      <div class="task-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="event.stopPropagation();toggleTaskStatus(${t.id})"></div>
      <div class="task-info">
        <div class="task-name ${t.status === 'completed' ? 'completed' : ''}">${escapeHtml(t.name)}</div>
        <div class="task-meta">
          <span class="priority-badge ${t.priority}">${t.priority} Priority</span>
          <span>• ${t.due}</span>
        </div>
      </div>
      <span class="task-tag ${t.category}">${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</span>
      <span class="task-duration">${t.duration} min</span>
      <div class="task-actions" onclick="event.stopPropagation()">⋮</div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function filterTasks(filter, btn) {
  currentTaskFilter = filter;
  document.querySelectorAll('.task-filter').forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

function toggleTaskStatus(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = task.status === 'completed' ? 'todo' : 'completed';
    saveTasksToLocalStorage();
    renderTasks();
  }
}

function viewTaskDetails(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    currentViewingTask = task;
    navigateTo('taskDetails');
    const titleEl = document.querySelector('.task-details-title');
    if (titleEl) titleEl.textContent = task.name;
    
    const badges = document.querySelector('.task-details-badges');
    if (badges) {
      badges.innerHTML = `<span class="priority-badge ${task.priority}">${task.priority} Priority</span>
        <span style="color:${task.priority==='high'?'var(--accent-red)':'var(--accent-orange)'};font-size:13px;font-weight:600;">${task.due}</span>
        <span class="task-tag ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>`;
    }
    renderSubtasks();
  }
}

function renderSubtasks() {
  const task = currentViewingTask;
  if (!task) return;
  const list = document.getElementById('subtaskList');
  if (!list) return;
  
  if (task.subtasks.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">No subtasks yet. Add some from edit mode.</div>';
    return;
  }
  
  list.innerHTML = task.subtasks.map((s, i) => `
    <div class="subtask">
      <div class="subtask-check ${s.done ? 'checked' : ''}" onclick="toggleSubtask(${i})"></div>
      <span class="subtask-name ${s.done ? 'completed' : ''}">${escapeHtml(s.name)}</span>
    </div>
  `).join('');
}

function toggleSubtask(index) {
  const task = currentViewingTask;
  if (task && task.subtasks[index]) {
    task.subtasks[index].done = !task.subtasks[index].done;
    saveTasksToLocalStorage();
    renderSubtasks();
  }
}

function completeTaskFromDetail() {
  const task = currentViewingTask;
  if (task) {
    task.status = 'completed';
    task.subtasks.forEach(s => s.done = true);
    saveTasksToLocalStorage();
    navigateTo('tasks');
    renderTasks();
  }
}

function openAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) {
    document.getElementById('newTaskName').value = '';
    document.getElementById('newTaskCategory').value = 'study';
    document.getElementById('newTaskPriority').value = 'medium';
    document.getElementById('newTaskDuration').value = '60';
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) modal.classList.add('hidden');
}

function addTask() {
  const name = document.getElementById('newTaskName').value.trim();
  if (!name) {
    alert('Please enter a task name');
    return;
  }
  
  const category = document.getElementById('newTaskCategory').value;
  const priority = document.getElementById('newTaskPriority').value;
  const duration = parseInt(document.getElementById('newTaskDuration').value) || 60;
  
  const newTask = {
    id: Date.now(),
    name: name,
    category: category,
    priority: priority,
    duration: duration,
    status: 'todo',
    due: 'No due date',
    subtasks: []
  };
  
  tasks.push(newTask);
  saveTasksToLocalStorage();
  closeModal();
  renderTasks();
  alert('Task added successfully!');
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToLocalStorage();
    renderTasks();
    if (currentViewingTask && currentViewingTask.id === id) {
      navigateTo('tasks');
    }
  }
}

// ==================== SCHEDULE ====================
const weekEvents = [
  { day: 1, time: '09:00', name: 'Biology Chapter 5', type: 'purple', duration: 90 },
  { day: 1, time: '10:45', name: 'Math Problem Set', type: 'orange', duration: 60 },
  { day: 1, time: '12:15', name: 'React Project', type: 'blue', duration: 120 },
  { day: 2, time: '09:00', name: 'Node.js Learning', type: 'purple', duration: 60 },
  { day: 2, time: '11:00', name: 'Read Book', type: 'green', duration: 45 },
  { day: 3, time: '10:00', name: 'Math Problem Set', type: 'orange', duration: 60 },
  { day: 4, time: '09:00', name: 'Personal Time', type: 'blue', duration: 60 },
  { day: 4, time: '14:00', name: 'Project Work', type: 'purple', duration: 120 },
  { day: 0, time: '08:00', name: 'Gym Workout', type: 'green', duration: 60 },
];

function renderWeekGrid() {
  const grid = document.getElementById('weekGrid');
  if (!grid) return;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dates = [19, 20, 21, 22, 23, 24, 25];
  const todayIdx = 6;
  
  let html = '<div class="week-header"><div class="week-header-cell"></div>';
  days.forEach((d, i) => {
    html += `<div class="week-header-cell ${i === todayIdx ? 'today-col' : ''}"><div class="day-name">${d}</div><div class="day-num">${dates[i]}</div></div>`;
  });
  html += '</div><div class="week-body">';
  
  const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
  hours.forEach(hour => {
    html += `<div class="time-slot">${hour}</div>`;
    for (let d = 0; d < 7; d++) {
      const events = weekEvents.filter(e => e.day === d);
      let eventsHtml = '';
      events.forEach(ev => {
        eventsHtml += `<div class="week-event ${ev.type}"><div>${ev.name}</div><div class="week-event-time">${ev.time} • ${ev.duration}m</div></div>`;
      });
      html += `<div class="week-cell ${d === todayIdx ? 'today-col' : ''}">${eventsHtml}</div>`;
    }
  });
  html += '</div>';
  grid.innerHTML = html;
}

function setScheduleView(view, btn) {
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');
}

function changeWeek(dir) {
  // Week navigation placeholder
}

// ==================== AI ASSISTANT ====================
function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  
  const messages = document.getElementById('aiMessages');
  messages.innerHTML += `
    <div class="ai-message user">
      <div class="ai-avatar user-av">AK</div>
      <div class="ai-bubble">${escapeHtml(text)}</div>
    </div>
  `;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  
  setTimeout(() => {
    const responses = [
      "Great question! Based on your current schedule, I'd recommend starting with your highest priority task first. Would you like me to help break it down into smaller steps?",
      "I've analyzed your productivity patterns. You tend to be most focused between 9 AM and 11 AM. I suggest scheduling your most challenging tasks during that window.",
      "Your progress is looking great! Keep up the good work! 🎉",
      "Based on your tasks, I suggest dedicating 2 hours daily to studying. Would you like me to create a study plan for you?",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    messages.innerHTML += `
      <div class="ai-message">
        <div class="ai-avatar bot">🤖</div>
        <div class="ai-bubble">${response}</div>
      </div>
    `;
    messages.scrollTop = messages.scrollHeight;
  }, 800);
}

function aiAction(action) {
  const messages = document.getElementById('aiMessages');
  
  if (action === 'adjust') {
    messages.innerHTML += `
      <div class="ai-message user">
        <div class="ai-avatar user-av">AK</div>
        <div class="ai-bubble">Yes, please adjust my schedule</div>
      </div>
    `;
    setTimeout(() => {
      messages.innerHTML += `
        <div class="ai-message">
          <div class="ai-avatar bot">🤖</div>
          <div class="ai-bubble">
            I've optimized your schedule:
            <ul>
              <li><strong>9:00 AM</strong> - Biology Chapter 5 (90 min)</li>
              <li><strong>10:45 AM</strong> - Math Problem Set (60 min)</li>
              <li><strong>12:00 PM</strong> - Lunch Break (30 min)</li>
              <li><strong>12:30 PM</strong> - React Project (120 min)</li>
            </ul>
            Your schedule has been updated! ✅
          </div>
        </div>
      `;
      messages.scrollTop = messages.scrollHeight;
    }, 800);
  } else {
    messages.innerHTML += `
      <div class="ai-message user">
        <div class="ai-avatar user-av">AK</div>
        <div class="ai-bubble">Show me the explanation</div>
      </div>
    `;
    setTimeout(() => {
      messages.innerHTML += `
        <div class="ai-message">
          <div class="ai-avatar bot">🤖</div>
          <div class="ai-bubble">
            Here's why I prioritized these tasks:<br><br>
            <strong>1. Biology Chapter 5</strong> - Due tomorrow, requires high focus.<br><br>
            <strong>2. Math Problem Set</strong> - Due in 2 days. Completing it today gives you a buffer day.<br><br>
            <strong>3. React Project</strong> - Consistent daily progress prevents last-minute stress.
          </div>
        </div>
      `;
      messages.scrollTop = messages.scrollHeight;
    }, 800);
  }
}

// ==================== ANALYTICS ====================
function renderBarChart() {
  const chart = document.getElementById('focusBarChart');
  if (!chart) return;
  
  const values = [3.2, 2.8, 3.5, 4.1, 3.8, 2.5, 3.0];
  const maxVal = Math.max(...values);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  chart.innerHTML = values.map((v, i) => `
    <div class="bar-group">
      <div class="bar" style="height:${(v/maxVal)*140}px;"></div>
      <span class="bar-label">${days[i]}</span>
    </div>
  `).join('');
}

function setAnalyticsPeriod(period, btn) {
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');
}

// ==================== TIMER WITH LOCALSTORAGE ====================
function renderSessionDots() {
  const dots = document.getElementById('sessionDots');
  if (!dots) return;
  
  dots.innerHTML = '';
  for (let i = 0; i < totalSessions; i++) {
    dots.innerHTML += `<div class="session-dot ${i < completedSessions ? 'completed' : ''}"></div>`;
  }
  updateSessionCount();
}

function setTimerMode(mode, btn) {
  timerMode = mode;
  const modes = document.querySelectorAll('.timer-mode');
  modes.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  if (mode === 'focus') {
    timerTotalSeconds = settings.focusTime * 60;
    document.getElementById('timerLabel').textContent = 'Focus Time';
  } else {
    timerTotalSeconds = settings.breakTime * 60;
    document.getElementById('timerLabel').textContent = 'Break Time';
  }
  
  timerSeconds = timerTotalSeconds;
  updateTimerDisplay();
  
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    updatePlayIcon();
  }
  
  saveTimerToLocalStorage();
}

function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
  } else {
    timerRunning = true;
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      }
      
      if (timerSeconds === 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        
        if (timerMode === 'focus') {
          if (settings.soundEnabled) {
            const beep = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
            beep.play().catch(e => console.log('Audio not supported'));
          }
          completedSessions = Math.min(completedSessions + 1, totalSessions);
          renderSessionDots();
          saveTimerToLocalStorage();
          
          const breakBtn = document.querySelector('.timer-mode:nth-child(2)');
          if (breakBtn) setTimerMode('break', breakBtn);
          alert('Focus session completed! Time for a break.');
        } else {
          if (settings.soundEnabled) {
            const beep = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
            beep.play().catch(e => console.log('Audio not supported'));
          }
          const focusBtn = document.querySelector('.timer-mode:nth-child(1)');
          if (focusBtn) setTimerMode('focus', focusBtn);
          alert('Break completed! Ready to focus again?');
        }
        updatePlayIcon();
      }
    }, 1000);
  }
  updatePlayIcon();
}

function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const display = document.getElementById('timerDisplay');
  if (display) display.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  
  const progress = document.getElementById('timerProgress');
  if (progress) {
    const circumference = 2 * Math.PI * 120;
    const offset = circumference * (1 - timerSeconds / timerTotalSeconds);
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = offset;
  }
}

function updatePlayIcon() {
  const icon = document.getElementById('playIcon');
  if (!icon) return;
  
  if (timerRunning) {
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
  } else {
    icon.innerHTML = '<polygon points="5,3 19,12 5,21"/>';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = timerTotalSeconds;
  updateTimerDisplay();
  updatePlayIcon();
}

function skipTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  if (timerMode === 'focus') {
    const breakBtn = document.querySelector('.timer-mode:nth-child(2)');
    if (breakBtn) setTimerMode('break', breakBtn);
  } else {
    const focusBtn = document.querySelector('.timer-mode:nth-child(1)');
    if (focusBtn) setTimerMode('focus', focusBtn);
  }
  updatePlayIcon();
}

function updateSessionCount() {
  const countEl = document.getElementById('sessionsCount');
  const progressFill = document.getElementById('sessionProgressFill');
  
  if (countEl) countEl.textContent = `${completedSessions} / ${totalSessions} completed`;
  if (progressFill) progressFill.style.width = `${(completedSessions/totalSessions)*100}%`;
}

// ==================== SETTINGS WITH LOCALSTORAGE ====================
function setSettingsTab(tab, btn) {
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  }
  btn.classList.add('active');
}

function saveSettings() {
  // Get theme
  const themeSelect = document.querySelectorAll('.settings-select')[0];
  if (themeSelect) settings.theme = themeSelect.value.toLowerCase();
  
  // Get focus time
  const focusSelect = document.querySelectorAll('.settings-select')[1];
  if (focusSelect) settings.focusTime = parseInt(focusSelect.value);
  
  // Get break time
  const breakSelect = document.querySelectorAll('.settings-select')[2];
  if (breakSelect) settings.breakTime = parseInt(breakSelect.value);
  
  // Get sound toggle
  const soundToggle = document.querySelectorAll('.settings-section .toggle-switch')[0];
  if (soundToggle) settings.soundEnabled = soundToggle.classList.contains('on');
  
  // Get reminder toggle
  const reminderToggle = document.querySelectorAll('.settings-section .toggle-switch')[1];
  if (reminderToggle) settings.remindersEnabled = reminderToggle.classList.contains('on');
  
  // Get daily goal
  const goalSelect = document.querySelectorAll('.settings-select')[3];
  if (goalSelect) settings.dailyGoal = parseInt(goalSelect);
  
  saveSettingsToLocalStorage();
  applySettings();
  alert('Settings saved!');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Load all data from localStorage
  loadTasksFromLocalStorage();
  loadTimerFromLocalStorage();
  loadSettingsFromLocalStorage();
  
  // Make all functions global
  window.showPage = showPage;
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.togglePassword = togglePassword;
  window.navigateTo = navigateTo;
  window.filterTasks = filterTasks;
  window.toggleTaskStatus = toggleTaskStatus;
  window.viewTaskDetails = viewTaskDetails;
  window.toggleSubtask = toggleSubtask;
  window.completeTaskFromDetail = completeTaskFromDetail;
  window.openAddTaskModal = openAddTaskModal;
  window.closeModal = closeModal;
  window.addTask = addTask;
  window.deleteTask = deleteTask;
  window.renderWeekGrid = renderWeekGrid;
  window.setScheduleView = setScheduleView;
  window.changeWeek = changeWeek;
  window.sendAiMessage = sendAiMessage;
  window.aiAction = aiAction;
  window.renderBarChart = renderBarChart;
  window.setAnalyticsPeriod = setAnalyticsPeriod;
  window.setTimerMode = setTimerMode;
  window.toggleTimer = toggleTimer;
  window.resetTimer = resetTimer;
  window.skipTimer = skipTimer;
  window.setSettingsTab = setSettingsTab;
  window.saveSettings = saveSettings;
  
  // Initial render
  if (document.getElementById('taskList')) {
    renderTasks();
  }
  if (document.getElementById('weekGrid')) {
    renderWeekGrid();
  }
  if (document.getElementById('focusBarChart')) {
    renderBarChart();
  }
  if (document.getElementById('sessionDots')) {
    renderSessionDots();
  }
  if (document.getElementById('timerDisplay')) {
    updateTimerDisplay();
  }
});