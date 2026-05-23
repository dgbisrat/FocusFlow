// ==================== USER AUTHENTICATION SYSTEM ====================
let users = JSON.parse(localStorage.getItem('focusflow_users')) || [];
let currentUser = null;
let currentPage = 'dashboard';
let pendingDeleteTaskId = null;

// Session persistence
function saveSession() {
  if (currentUser) {
    localStorage.setItem('focusflow_current_user', JSON.stringify({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar
    }));
  } else {
    localStorage.removeItem('focusflow_current_user');
  }
}

function loadSession() {
  const savedUser = localStorage.getItem('focusflow_current_user');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    currentUser = userData;
    updateUserUI();
    loadAllData();
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appLayout').classList.remove('hidden');
    navigateTo(currentPage);
    return true;
  }
  return false;
}

// Strong password validation
function isStrongPassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecial;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidName(name) {
  return name && name.length >= 2 && name.length <= 25;
}

function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  document.getElementById('signupNameError').textContent = '';
  document.getElementById('signupEmailError').textContent = '';
  document.getElementById('signupPasswordError').textContent = '';
  document.getElementById('signupConfirmError').textContent = '';
  
  let hasError = false;
  
  if (!isValidName(name)) {
    document.getElementById('signupNameError').textContent = 'Name must be 2-25 characters';
    document.getElementById('signupName').classList.add('error');
    hasError = true;
  } else {
    document.getElementById('signupName').classList.remove('error');
  }
  
  if (!email || !isValidEmail(email)) {
    document.getElementById('signupEmailError').textContent = 'Valid email is required';
    document.getElementById('signupEmail').classList.add('error');
    hasError = true;
  } else if (users.some(u => u.email === email)) {
    document.getElementById('signupEmailError').textContent = 'Email already registered';
    document.getElementById('signupEmail').classList.add('error');
    hasError = true;
  } else {
    document.getElementById('signupEmail').classList.remove('error');
  }
  
  if (!password) {
    document.getElementById('signupPasswordError').textContent = 'Password is required';
    document.getElementById('signupPassword').classList.add('error');
    hasError = true;
  } else if (!isStrongPassword(password)) {
    document.getElementById('signupPasswordError').textContent = 'Password must be 8+ chars with uppercase, lowercase, number, and special character';
    document.getElementById('signupPassword').classList.add('error');
    hasError = true;
  } else {
    document.getElementById('signupPassword').classList.remove('error');
  }
  
  if (password !== confirmPassword) {
    document.getElementById('signupConfirmError').textContent = 'Passwords do not match';
    document.getElementById('signupConfirmPassword').classList.add('error');
    hasError = true;
  } else {
    document.getElementById('signupConfirmPassword').classList.remove('error');
  }
  
  if (hasError) return;
  
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    avatar: name.charAt(0).toUpperCase(),
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('focusflow_users', JSON.stringify(users));
  
  alert('Account created successfully! Please login.');
  showAuthPage('login');
  
  document.getElementById('signupName').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupConfirmPassword').value = '';
}

function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  document.getElementById('loginEmailError').textContent = '';
  document.getElementById('loginPasswordError').textContent = '';
  document.getElementById('loginEmail').classList.remove('error');
  document.getElementById('loginPassword').classList.remove('error');
  
  let hasError = false;
  
  if (!email || !isValidEmail(email)) {
    document.getElementById('loginEmailError').textContent = 'Valid email is required';
    document.getElementById('loginEmail').classList.add('error');
    hasError = true;
  }
  
  if (!password) {
    document.getElementById('loginPasswordError').textContent = 'Password is required';
    document.getElementById('loginPassword').classList.add('error');
    hasError = true;
  }
  
  if (hasError) return;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    document.getElementById('loginEmailError').textContent = 'Invalid email or password';
    document.getElementById('loginEmail').classList.add('error');
    document.getElementById('loginPassword').classList.add('error');
    return;
  }
  
  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.name.charAt(0).toUpperCase()
  };
  
  saveSession();
  updateUserUI();
  loadAllData();
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appLayout').classList.remove('hidden');
  navigateTo('dashboard');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('focusflow_current_user');
  document.getElementById('appLayout').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

function loadProfileData() {
  document.getElementById('profileName').value = currentUser.name;
  document.getElementById('profileEmail').value = currentUser.email;
  document.getElementById('profilePassword').value = '';
  document.getElementById('profileConfirmPassword').value = '';
}

function handleProfileUpdate(e) {
  e.preventDefault();
  
  const newName = document.getElementById('profileName').value.trim();
  const newEmail = document.getElementById('profileEmail').value.trim();
  const newPassword = document.getElementById('profilePassword').value;
  const confirmPassword = document.getElementById('profileConfirmPassword').value;
  
  document.getElementById('profileNameError').textContent = '';
  document.getElementById('profileEmailError').textContent = '';
  document.getElementById('profilePasswordError').textContent = '';
  
  let hasError = false;
  
  if (!isValidName(newName)) {
    document.getElementById('profileNameError').textContent = 'Name must be 2-25 characters';
    document.getElementById('profileName').classList.add('error');
    hasError = true;
  } else {
    document.getElementById('profileName').classList.remove('error');
  }
  
  if (!isValidEmail(newEmail)) {
    document.getElementById('profileEmailError').textContent = 'Valid email is required';
    document.getElementById('profileEmail').classList.add('error');
    hasError = true;
  } else if (newEmail !== currentUser.email && users.some(u => u.email === newEmail)) {
    document.getElementById('profileEmailError').textContent = 'Email already in use';
    document.getElementById('profileEmail').classList.add('error');
    hasError = true;
  } else {
    document.getElementById('profileEmail').classList.remove('error');
  }
  
  if (newPassword) {
    if (!isStrongPassword(newPassword)) {
      document.getElementById('profilePasswordError').textContent = 'Password must be 8+ chars with upper, lower, number, special';
      document.getElementById('profilePassword').classList.add('error');
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      document.getElementById('profilePasswordError').textContent = 'Passwords do not match';
      document.getElementById('profilePassword').classList.add('error');
      hasError = true;
    } else {
      document.getElementById('profilePassword').classList.remove('error');
    }
  }
  
  if (hasError) return;
  
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].name = newName;
    users[userIndex].email = newEmail;
    if (newPassword) users[userIndex].password = newPassword;
    localStorage.setItem('focusflow_users', JSON.stringify(users));
  }
  
  currentUser.name = newName;
  currentUser.email = newEmail;
  currentUser.avatar = newName.charAt(0).toUpperCase();
  saveSession();
  updateUserUI();
  
  alert('Profile updated successfully!');
  navigateTo('dashboard');
}

function cancelProfileEdit() {
  navigateTo('dashboard');
}

// ==================== DATA & STATE ====================
let tasks = JSON.parse(localStorage.getItem('focusflow_tasks')) || [
  { id: 1, name: 'Finish Biology chapter 5', duration: 90, difficulty: 'hard', deadline: 'today', deadlineLabel: '⚠️ Due Today', status: 'todo', createdAt: Date.now() - 86400000 },
  { id: 2, name: 'Math problem set', duration: 60, difficulty: 'medium', deadline: 'tomorrow', deadlineLabel: '🟡 Due Tomorrow', status: 'todo', createdAt: Date.now() - 172800000 },
  { id: 3, name: 'React project UI', duration: 120, difficulty: 'hard', deadline: 'thisweek', deadlineLabel: '🟢 Due This Week', status: 'inprogress', createdAt: Date.now() - 259200000 },
  { id: 4, name: 'English essay outline', duration: 45, difficulty: 'easy', deadline: 'nextweek', deadlineLabel: '⚪ Due Next Week', status: 'todo', createdAt: Date.now() - 345600000 }
];

let currentFilter = 'all';
let timerInterval = null;
let timerActive = false;
let timerSeconds = 25 * 60;
let timerMode = 'focus';
let focusMins = 25;
let breakMins = 5;
let completedSessions = 0;
let totalDailyGoal = 8;
let focusHistory = JSON.parse(localStorage.getItem('focusflow_history')) || [];

// ==================== PRIORITY CALCULATION ====================
function calculatePriorityScore(task) {
  let deadlineScore = 0;
  const now = Date.now();
  const taskAge = now - (task.createdAt || now);
  const hoursOld = taskAge / (1000 * 60 * 60);
  
  switch(task.deadline) {
    case 'today': deadlineScore = 100 - Math.min(30, hoursOld); break;
    case 'tomorrow': deadlineScore = 70 - Math.min(20, hoursOld / 2); break;
    case 'thisweek': deadlineScore = 40 - Math.min(15, hoursOld / 8); break;
    case 'nextweek': deadlineScore = 20 - Math.min(10, hoursOld / 24); break;
    default: deadlineScore = 30;
  }
  
  let difficultyScore = 0;
  switch(task.difficulty) {
    case 'hard': difficultyScore = 30; break;
    case 'medium': difficultyScore = 15; break;
    case 'easy': difficultyScore = 5; break;
  }
  
  return Math.max(0, Math.min(100, deadlineScore + difficultyScore));
}

function getUrgencyLabel(task) {
  const score = calculatePriorityScore(task);
  if (score >= 80) return { text: '🔴 CRITICAL', class: 'urgency-critical', order: 1 };
  if (score >= 60) return { text: '🟠 URGENT', class: 'urgency-urgent', order: 2 };
  if (score >= 40) return { text: '🟡 NORMAL', class: 'urgency-normal', order: 3 };
  return { text: '🟢 LOW', class: 'urgency-low', order: 4 };
}

function getDifficultyLabel(difficulty) {
  switch(difficulty) {
    case 'hard': return { text: '🔴 Hard', class: 'difficulty-hard' };
    case 'medium': return { text: '🟠 Medium', class: 'difficulty-medium' };
    case 'easy': return { text: '🟢 Easy', class: 'difficulty-easy' };
    default: return { text: 'Medium', class: 'difficulty-medium' };
  }
}

// Sort tasks by priority: Critical → Urgent → Normal → Low, then by score
function getSortedTasksByPriority() {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    
    const urgencyA = getUrgencyLabel(a).order;
    const urgencyB = getUrgencyLabel(b).order;
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    
    return calculatePriorityScore(b) - calculatePriorityScore(a);
  });
}

// ==================== TASKS WITH DELETE CONFIRMATION ====================
function saveTasks() {
  localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
  updateDashboard();
  renderTasksList();
  updateAnalytics();
}

function renderTasksList() {
  let filtered = tasks;
  if (currentFilter === 'todo') filtered = tasks.filter(t => t.status === 'todo');
  else if (currentFilter === 'inprogress') filtered = tasks.filter(t => t.status === 'inprogress');
  else if (currentFilter === 'completed') filtered = tasks.filter(t => t.status === 'completed');
  
  // Sort filtered tasks by priority
  const sortedFiltered = [...filtered].sort((a, b) => {
    const urgencyA = getUrgencyLabel(a).order;
    const urgencyB = getUrgencyLabel(b).order;
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    return calculatePriorityScore(b) - calculatePriorityScore(a);
  });
  
  const container = document.getElementById('taskListContainer');
  if (!container) return;
  
  if (sortedFiltered.length === 0) {
    container.innerHTML = '<div class="card" style="text-align: center; padding: 40px;">✨ No tasks found. Add a new task to get started!</div>';
    return;
  }
  
  container.innerHTML = sortedFiltered.map(t => {
    const urgency = getUrgencyLabel(t);
    const difficulty = getDifficultyLabel(t.difficulty);
    return `
      <div class="task-item">
        <div class="task-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="toggleTaskStatus(${t.id})"></div>
        <div class="task-content" onclick="toggleTaskStatus(${t.id})">
          <div style="font-weight: 600; ${t.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(t.name)}</div>
          <div style="margin-top: 6px; display: flex; gap: 10px; flex-wrap: wrap;">
            <span class="urgency-badge ${urgency.class}">${urgency.text}</span>
            <span class="${difficulty.class}">${difficulty.text}</span>
            <span style="font-size: 12px; color: var(--text-secondary);">⏱️ ${t.duration} min</span>
            <span style="font-size: 12px; color: var(--text-secondary);">📅 ${t.deadlineLabel}</span>
          </div>
        </div>
        <button class="task-delete-btn" onclick="showDeleteConfirm(${t.id}, '${escapeHtml(t.name)}')" title="Delete task">🗑️</button>
      </div>
    `;
  }).join('');
}

function toggleTaskStatus(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = task.status === 'completed' ? 'todo' : 'completed';
    saveTasks();
    renderTasksList();
  }
}

function showDeleteConfirm(taskId, taskName) {
  pendingDeleteTaskId = taskId;
  document.getElementById('deleteTaskName').innerHTML = `<strong>"${taskName}"</strong>`;
  document.getElementById('deleteModal').classList.remove('hidden');
}

function confirmDeleteTask() {
  if (pendingDeleteTaskId) {
    tasks = tasks.filter(t => t.id !== pendingDeleteTaskId);
    saveTasks();
    renderTasksList();
    closeDeleteModal();
  }
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.add('hidden');
  pendingDeleteTaskId = null;
}

function openTaskModal() {
  document.getElementById('taskModal').classList.remove('hidden');
  document.getElementById('taskNameInput').value = '';
  document.getElementById('taskDurationInput').value = '';
  document.getElementById('taskDifficultyInput').value = 'medium';
  document.getElementById('taskDeadlineInput').value = 'thisweek';
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.add('hidden');
}

function addNewTask() {
  const name = document.getElementById('taskNameInput').value.trim();
  const duration = parseInt(document.getElementById('taskDurationInput').value);
  const difficulty = document.getElementById('taskDifficultyInput').value;
  const deadline = document.getElementById('taskDeadlineInput').value;
  
  if (!name) {
    alert('Please enter a task name');
    return;
  }
  
  if (!duration || duration < 1) {
    alert('Please enter a valid duration (1-480 minutes)');
    return;
  }
  
  const deadlineLabels = {
    'today': '⚠️ Due Today',
    'tomorrow': '🟡 Due Tomorrow',
    'thisweek': '🟢 Due This Week',
    'nextweek': '⚪ Due Next Week'
  };
  
  const newTask = {
    id: Date.now(),
    name: name,
    duration: duration,
    difficulty: difficulty,
    deadline: deadline,
    deadlineLabel: deadlineLabels[deadline],
    status: 'todo',
    createdAt: Date.now()
  };
  
  tasks.push(newTask);
  saveTasks();
  closeTaskModal();
  renderTasksList();
  updateDashboard();
}

function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.task-filter').forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  renderTasksList();
}

// ==================== HELPER FUNCTIONS ====================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showAuthPage(page) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('signupPage').classList.add('hidden');
  if (page === 'login') {
    document.getElementById('loginPage').classList.remove('hidden');
  } else {
    document.getElementById('signupPage').classList.remove('hidden');
  }
}

function updateUserUI() {
  if (currentUser) {
    document.getElementById('userAvatar').textContent = currentUser.avatar;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    const hour = new Date().getHours();
    let greeting = 'Good day';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    document.getElementById('greetingMsg').textContent = `${greeting}, ${currentUser.name}! 👋`;
  }
}

// ==================== DASHBOARD ====================
function updateDashboard() {
  const todoCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const focusProgress = Math.floor((completedSessions / (totalDailyGoal || 1)) * 100);
  
  const statsDiv = document.getElementById('statsRow');
  if (statsDiv) {
    statsDiv.innerHTML = `
      <div class="stat-card"><div class="stat-value">${todoCount}</div><div class="stat-label">Pending Tasks</div></div>
      <div class="stat-card"><div class="stat-value">${completedCount}</div><div class="stat-label">Completed</div></div>
      <div class="stat-card"><div class="stat-value">${completedSessions}</div><div class="stat-label">Today's Sessions</div></div>
      <div class="stat-card"><div class="stat-value">${focusProgress}%</div><div class="stat-label">Daily Goal</div></div>
    `;
  }
  
  const priorityList = document.getElementById('priorityTaskList');
  if (priorityList) {
    const sortedTasks = getSortedTasksByPriority();
    const activeTasks = sortedTasks.filter(t => t.status !== 'completed').slice(0, 5);
    
    if (activeTasks.length === 0) {
      priorityList.innerHTML = '<div style="color: var(--text-secondary); padding: 20px 0; text-align: center;">✨ All tasks completed! Great job!</div>';
    } else {
      priorityList.innerHTML = activeTasks.map(task => {
        const urgency = getUrgencyLabel(task);
        const difficulty = getDifficultyLabel(task.difficulty);
        const score = calculatePriorityScore(task);
        return `
          <div class="priority-task-item" onclick="toggleTaskStatus(${task.id})">
            <div class="priority-task-left">
              <div class="priority-task-name">${escapeHtml(task.name)}</div>
              <div class="priority-task-meta">
                <span class="urgency-badge ${urgency.class}">${urgency.text}</span>
                <span class="${difficulty.class}">${difficulty.text}</span>
                <span>⏱️ ${task.duration} min</span>
                <span>📅 ${task.deadlineLabel}</span>
              </div>
            </div>
            <div class="priority-score" style="color: ${score >= 70 ? '#dc2626' : score >= 40 ? '#f59e0b' : '#10b981'}">
              ${Math.round(score)}%
            </div>
          </div>
        `;
      }).join('');
    }
  }
  
  const tipDiv = document.getElementById('dailyTip');
  if (tipDiv) {
    const urgentTasks = tasks.filter(t => t.status !== 'completed' && (t.deadline === 'today' || t.deadline === 'tomorrow'));
    if (urgentTasks.length > 0) {
      tipDiv.innerHTML = `<p>🎯 You have ${urgentTasks.length} urgent task(s)! Focus on "${urgentTasks[0].name}" first (${urgentTasks[0].difficulty} difficulty, ${urgentTasks[0].duration} min).</p>`;
    } else {
      tipDiv.innerHTML = `<p>💡 Great job staying on top of deadlines! Use the focus timer to maintain momentum.</p>`;
    }
  }
}

// ==================== AI ASSISTANT ====================
function generateSmartLocalResponse(message) {
  const lowerMsg = message.toLowerCase();
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const urgentTasks = tasks.filter(t => t.status !== 'completed' && (t.deadline === 'today' || t.deadline === 'tomorrow'));
  const topTask = getSortedTasksByPriority()[0];
  
  if (lowerMsg.includes('priority') || lowerMsg.includes('urgent') || lowerMsg.includes('what should i do')) {
    if (urgentTasks.length > 0) {
      return `🎯 Based on your deadlines and difficulty, your most urgent task${urgentTasks.length > 1 ? 's are' : ' is'}:\n\n${urgentTasks.slice(0, 3).map(t => `📌 ${t.name} (${t.difficulty}, ${t.deadlineLabel}, ${t.duration} min)`).join('\n')}\n\nStart with the hardest one first for maximum productivity!`;
    } else if (topTask) {
      return `🎯 Your top priority task is:\n\n📌 "${topTask.name}"\n⏱️ ${topTask.duration} minutes\n📅 ${topTask.deadlineLabel}\n🔧 Difficulty: ${topTask.difficulty}\n\nI recommend starting this now!`;
    }
    return "📋 You have no pending tasks. Great job! Take a break or plan ahead.";
  }
  
  if (lowerMsg.includes('deadline') || lowerMsg.includes('due')) {
    if (urgentTasks.length > 0) {
      return `⚠️ You have ${urgentTasks.length} urgent task(s) approaching deadline:\n${urgentTasks.map(t => `- ${t.name} (${t.deadlineLabel})`).join('\n')}\n\nFocus on these immediately!`;
    }
    return "📅 Great news! You have no urgent deadlines. Keep up the good work!";
  }
  
  if (lowerMsg.includes('focus') || lowerMsg.includes('productivity')) {
    const percent = Math.round((completedSessions / totalDailyGoal) * 100);
    if (completedSessions < totalDailyGoal / 2) {
      return `🧠 You've completed ${completedSessions}/${totalDailyGoal} focus sessions (${percent}%). \n\n💡 Tip: Try the Pomodoro technique - 25 min work, 5 min break. Start with your hardest task first thing in the morning!`;
    }
    return `🌟 Amazing! You've completed ${completedSessions}/${totalDailyGoal} focus sessions (${percent}%). Keep this momentum going! 🚀`;
  }
  
  if (lowerMsg.includes('motivate') || lowerMsg.includes('motivation')) {
    const quotes = [
      "💪 \"The secret of getting ahead is getting started.\" - Mark Twain",
      "🎯 \"You don't have to be great to start, but you have to start to be great.\" - Zig Ziglar",
      "🌟 \"Small daily improvements over time lead to stunning results.\"",
      "⚡ \"Your future self will thank you for the work you do today.\""
    ];
    return quotes[Math.floor(Math.random() * quotes.length)] + "\n\nYou've got this! 💪";
  }
  
  return `💡 You have ${pendingCount} pending task(s). ${urgentTasks.length > 0 ? `You have ${urgentTasks.length} urgent task(s) - focus on those first!` : "Great job staying on top of your deadlines!"} Would you like me to help you prioritize?`;
}

async function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const message = input.value.trim();
  if (!message) return;
  
  addAIMessage(message, true);
  input.value = '';
  
  const typingId = showTypingIndicator();
  
  setTimeout(() => {
    removeTypingIndicator(typingId);
    const response = generateSmartLocalResponse(message);
    addAIMessage(response, false);
  }, 500);
}

function showTypingIndicator() {
  const chat = document.getElementById('aiChat');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-message bot';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = '<div class="message-bubble bot">🤔 Thinking...</div>';
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;
  return 'typing-indicator';
}

function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) indicator.remove();
}

function addAIMessage(message, isUser = false) {
  const chat = document.getElementById('aiChat');
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${isUser ? 'user' : 'bot'}`;
  messageDiv.innerHTML = `<div class="message-bubble ${isUser ? 'user' : 'bot'}">${escapeHtml(message)}</div>`;
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}

// ==================== TIMER ====================
function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  document.getElementById('timerDisplay').innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  const total = timerMode === 'focus' ? focusMins * 60 : breakMins * 60;
  const circumference = 2 * Math.PI * 115;
  const offset = circumference * (1 - timerSeconds / total);
  const arc = document.getElementById('timerProgressArc');
  if (arc) {
    arc.style.strokeDasharray = circumference;
    arc.style.strokeDashoffset = offset;
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerActive = true;
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerActive = false;
      
      if (timerMode === 'focus') {
        completedSessions = Math.min(completedSessions + 1, totalDailyGoal);
        focusHistory.push({ date: new Date().toISOString().split('T')[0], sessions: 1 });
        localStorage.setItem('focusflow_history', JSON.stringify(focusHistory));
        updateSessionUI();
        updateDashboard();
        saveTimerData();
        updateAnalytics();
        alert('🎉 Focus session completed! Time for a break!');
        setTimerModeManually('break');
      } else {
        alert('☕ Break completed! Ready to focus again?');
        setTimerModeManually('focus');
      }
      updatePlayPauseButton();
    } else {
      timerSeconds--;
      updateTimerDisplay();
    }
  }, 1000);
  updatePlayPauseButton();
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerActive = false;
    updatePlayPauseButton();
  }
}

function toggleTimer() {
  if (timerActive) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  pauseTimer();
  timerSeconds = timerMode === 'focus' ? focusMins * 60 : breakMins * 60;
  updateTimerDisplay();
}

function skipTimer() {
  pauseTimer();
  timerSeconds = 0;
  updateTimerDisplay();
}

function setTimerModeManually(mode) {
  timerMode = mode;
  pauseTimer();
  timerSeconds = mode === 'focus' ? focusMins * 60 : breakMins * 60;
  updateTimerDisplay();
  
  document.getElementById('timerLabel').innerText = mode === 'focus' ? 'Focus Time' : 'Break Time';
  document.querySelectorAll('.timer-mode').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-timermode') === mode) {
      btn.classList.add('active');
    }
  });
  saveTimerData();
}

function updatePlayPauseButton() {
  const btn = document.getElementById('timerPlayPause');
  if (btn) {
    btn.innerText = timerActive ? '⏸' : '▶';
  }
}

function updateSessionUI() {
  const percent = (completedSessions / totalDailyGoal) * 100;
  document.getElementById('sessionFill').style.width = `${percent}%`;
  document.getElementById('sessionCountText').innerText = `${completedSessions} / ${totalDailyGoal} sessions completed`;
  saveTimerData();
}

function saveTimerData() {
  localStorage.setItem('focusflow_timer', JSON.stringify({
    completedSessions: completedSessions,
    totalDailyGoal: totalDailyGoal,
    timerMode: timerMode
  }));
}

function loadTimerData() {
  const saved = localStorage.getItem('focusflow_timer');
  if (saved) {
    const data = JSON.parse(saved);
    completedSessions = data.completedSessions || 0;
    totalDailyGoal = data.totalDailyGoal || 8;
    timerMode = data.timerMode || 'focus';
    timerSeconds = timerMode === 'focus' ? focusMins * 60 : breakMins * 60;
    updateSessionUI();
    updateTimerDisplay();
  } else {
    completedSessions = 0;
    updateSessionUI();
  }
}

// ==================== ANALYTICS ====================
function updateAnalytics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const pending = total - completed;
  
  const critical = tasks.filter(t => calculatePriorityScore(t) >= 80 && t.status !== 'completed').length;
  const urgent = tasks.filter(t => calculatePriorityScore(t) >= 60 && calculatePriorityScore(t) < 80 && t.status !== 'completed').length;
  const normal = tasks.filter(t => calculatePriorityScore(t) >= 40 && calculatePriorityScore(t) < 60 && t.status !== 'completed').length;
  const low = tasks.filter(t => calculatePriorityScore(t) < 40 && t.status !== 'completed').length;
  
  const statsDiv = document.getElementById('analyticsStats');
  if (statsDiv) {
    statsDiv.innerHTML = `
      <div class="stat-card"><div class="stat-value">${completed}</div><div class="stat-label">Completed Tasks</div></div>
      <div class="stat-card"><div class="stat-value">${rate}%</div><div class="stat-label">Completion Rate</div></div>
      <div class="stat-card"><div class="stat-value">${completedSessions}</div><div class="stat-label">Focus Sessions</div></div>
      <div class="stat-card"><div class="stat-value">${pending}</div><div class="stat-label">Pending Tasks</div></div>
    `;
  }
  
  const chartDiv = document.getElementById('completionChart');
  if (chartDiv) {
    chartDiv.innerHTML = `
      <div style="background: var(--primary-bg); border-radius: 20px; overflow: hidden; height: 80px;">
        <div style="width: ${rate}%; height: 100%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; transition: width 0.5s;">
          ${rate}%
        </div>
      </div>
    `;
  }
  
  const priorityChart = document.getElementById('priorityChart');
  if (priorityChart) {
    const maxVal = Math.max(critical, urgent, normal, low, 1);
    priorityChart.innerHTML = `
      <div class="priority-chart">
        <div class="priority-bar"><div class="priority-bar-fill" style="height: ${(critical / maxVal) * 100}px; background: #dc2626;"></div><div style="font-size: 11px;">Critical</div><div>${critical}</div></div>
        <div class="priority-bar"><div class="priority-bar-fill" style="height: ${(urgent / maxVal) * 100}px; background: #f59e0b;"></div><div style="font-size: 11px;">Urgent</div><div>${urgent}</div></div>
        <div class="priority-bar"><div class="priority-bar-fill" style="height: ${(normal / maxVal) * 100}px; background: #3b82f6;"></div><div style="font-size: 11px;">Normal</div><div>${normal}</div></div>
        <div class="priority-bar"><div class="priority-bar-fill" style="height: ${(low / maxVal) * 100}px; background: #10b981;"></div><div style="font-size: 11px;">Low</div><div>${low}</div></div>
      </div>
    `;
  }
  
  const achievements = [];
  if (completed >= 10) achievements.push({ icon: '🏆', title: 'Task Master', desc: 'Completed 10+ tasks' });
  if (completedSessions >= 20) achievements.push({ icon: '🔥', title: 'Focus Warrior', desc: '20+ focus sessions' });
  if (rate >= 80) achievements.push({ icon: '⭐', title: 'Productivity Pro', desc: '80%+ completion rate' });
  if (tasks.filter(t => t.status !== 'completed').length === 0) achievements.push({ icon: '🎯', title: 'Zero Inbox', desc: 'All tasks completed' });
  
  const achievementsDiv = document.getElementById('achievementsList');
  if (achievementsDiv) {
    if (achievements.length === 0) {
      achievementsDiv.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">Complete more tasks to earn achievements! 🎯</div>';
    } else {
      achievementsDiv.innerHTML = achievements.map(a => `
        <div class="achievement-item">
          <div class="achievement-icon">${a.icon}</div>
          <div class="achievement-info">
            <div class="achievement-title">${a.title}</div>
            <div class="achievement-desc">${a.desc}</div>
          </div>
        </div>
      `).join('');
    }
  }
  
  const insightsDiv = document.getElementById('performanceInsights');
  if (insightsDiv) {
    const urgentCount = tasks.filter(t => t.status !== 'completed' && (t.deadline === 'today' || t.deadline === 'tomorrow')).length;
    const insights = [];
    
    if (urgentCount > 2) insights.push({ icon: '⚠️', text: `You have ${urgentCount} urgent tasks. Focus on these first!` });
    if (rate < 50 && total > 5) insights.push({ icon: '📈', text: 'Try breaking large tasks into smaller chunks for better completion rates.' });
    if (completedSessions < totalDailyGoal / 2 && totalDailyGoal > 0) insights.push({ icon: '⏱️', text: 'Increase focus sessions to meet your daily goal. Start with 25-minute sprints!' });
    if (rate >= 70) insights.push({ icon: '🎉', text: 'Great productivity! Keep maintaining this momentum.' });
    
    if (insights.length === 0) insights.push({ icon: '💪', text: 'You\'re doing great! Keep up the consistent work.' });
    
    insightsDiv.innerHTML = insights.map(i => `
      <div class="insight-item">
        <div class="insight-icon">${i.icon}</div>
        <div class="insight-text">${i.text}</div>
      </div>
    `).join('');
  }
}

// ==================== SETTINGS ====================
function loadSettings() {
  const saved = localStorage.getItem('focusflow_settings');
  if (saved) {
    const s = JSON.parse(saved);
    focusMins = s.focusMins || 25;
    breakMins = s.breakMins || 5;
    totalDailyGoal = s.totalDailyGoal || 8;
    document.getElementById('focusDurationInput').value = focusMins;
    document.getElementById('breakDurationInput').value = breakMins;
    document.getElementById('dailyGoalInput').value = totalDailyGoal;
  }
  timerSeconds = timerMode === 'focus' ? focusMins * 60 : breakMins * 60;
  updateTimerDisplay();
  updateSessionUI();
}

function saveSettings() {
  focusMins = parseInt(document.getElementById('focusDurationInput').value) || 25;
  breakMins = parseInt(document.getElementById('breakDurationInput').value) || 5;
  totalDailyGoal = parseInt(document.getElementById('dailyGoalInput').value) || 8;
  
  localStorage.setItem('focusflow_settings', JSON.stringify({
    focusMins, breakMins, totalDailyGoal
  }));
  
  timerSeconds = timerMode === 'focus' ? focusMins * 60 : breakMins * 60;
  updateTimerDisplay();
  updateSessionUI();
  updateDashboard();
  alert('✅ Settings saved successfully!');
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('focusflow_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function loadTheme() {
  const theme = localStorage.getItem('focusflow_theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(page + 'Page');
  if (targetPage) targetPage.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-nav="${page}"]`);
  if (navItem) navItem.classList.add('active');
  
  if (page === 'tasks') renderTasksList();
  if (page === 'analytics') updateAnalytics();
  if (page === 'dashboard') updateDashboard();
  if (page === 'profile') loadProfileData();
}

function loadAllData() {
  loadTimerData();
  loadSettings();
  renderTasksList();
  updateDashboard();
  updateAnalytics();
  addAIMessage("👋 Hello! I'm your AI productivity assistant. Tasks are sorted by urgency (Critical → Urgent → Normal → Low). Ask me about your priorities, deadlines, or for productivity tips!", false);
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  
  if (!loadSession()) {
    showAuthPage('login');
  }
  
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
  document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-nav');
      navigateTo(page);
    });
  });
  
  document.querySelectorAll('.task-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      filterTasks(btn.getAttribute('data-filter'), btn);
    });
  });
  
  document.getElementById('timerPlayPause').addEventListener('click', toggleTimer);
  document.getElementById('timerResetBtn').addEventListener('click', resetTimer);
  document.getElementById('timerSkipBtn').addEventListener('click', skipTimer);
  
  document.querySelectorAll('.timer-mode').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimerModeManually(btn.getAttribute('data-timermode'));
    });
  });
  
  document.getElementById('aiSendBtn').addEventListener('click', sendAIMessage);
  document.getElementById('aiInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAIMessage();
  });
  
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  
  document.querySelectorAll('.analytics-period').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.analytics-period').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAnalytics();
    });
  });
  
  window.showAuthPage = showAuthPage;
  window.toggleTaskStatus = toggleTaskStatus;
  window.openTaskModal = openTaskModal;
  window.closeTaskModal = closeTaskModal;
  window.addNewTask = addNewTask;
  window.filterTasks = filterTasks;
  window.navigateTo = navigateTo;
  window.logout = logout;
  window.cancelProfileEdit = cancelProfileEdit;
  window.showDeleteConfirm = showDeleteConfirm;
  window.confirmDeleteTask = confirmDeleteTask;
  window.closeDeleteModal = closeDeleteModal;
});