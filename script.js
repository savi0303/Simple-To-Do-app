document.addEventListener('DOMContentLoaded', () => {
    // Task array and load from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'All';
  
    // DOM elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const categoryInput = document.getElementById('categoryInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.filter-btn');
  
    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  
    // Save tasks to local storage
    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    // Check for overdue tasks and set reminders
    function checkReminders() {
      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const due = new Date(task.dueDate);
          if (due < now && Notification.permission === 'granted') {
            new Notification(`Task "${task.text}" is overdue!`);
          } else if (due - now <= 24 * 60 * 60 * 1000 && due > now) {
            if (Notification.permission === 'granted') {
              new Notification(`Reminder: Task "${task.text}" is due soon!`);
            }
          }
        }
      });
    }
  
    // Render tasks
    function renderTasks() {
      taskList.innerHTML = '';
      const filteredTasks =
        currentFilter === 'All'
          ? tasks
          : tasks.filter(task => task.category === currentFilter);
  
      filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} ${
          task.dueDate && new Date(task.dueDate) < new Date() && !task.completed ? 'overdue' : ''
        }`;
        li.draggable = true;
        li.dataset.index = index;
  
        li.innerHTML = `
          <span class="task-text">${task.text} (${task.category})${
            task.dueDate ? ` - Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''
          }</span>
          <div class="flex gap-2">
            <button class="toggle-btn bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
              ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="edit-btn bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
              Edit
            </button>
            <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        `;
  
        taskList.appendChild(li);
  
        // Event listeners for buttons
        li.querySelector('.toggle-btn').addEventListener('click', () => {
          tasks[index].completed = !tasks[index].completed;
          saveTasks();
          renderTasks();
        });
  
        li.querySelector('.edit-btn').addEventListener('click', () => {
          const newText = prompt('Edit task:', task.text);
          if (newText) {
            tasks[index].text = newText;
            saveTasks();
            renderTasks();
          }
        });
  
        li.querySelector('.delete-btn').addEventListener('click', () => {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
        });
  
        // Drag-and-drop events
        li.addEventListener('dragstart', () => {
          li.classList.add('dragging');
        });
  
        li.addEventListener('dragend', () => {
          li.classList.remove('dragging');
        });
  
        li.addEventListener('dragover', e => {
          e.preventDefault();
        });
  
        li.addEventListener('drop', () => {
          const draggedIndex = parseInt(document.querySelector('.dragging').dataset.index);
          const droppedIndex = index;
          const [draggedTask] = tasks.splice(draggedIndex, 1);
          tasks.splice(droppedIndex, 0, draggedTask);
          saveTasks();
          renderTasks();
        });
      });
  
      checkReminders();
    }
  
    // Form submission
    taskForm.addEventListener('submit', e => {
      e.preventDefault();
      const taskText = taskInput.value.trim();
      const category = categoryInput.value;
      const dueDate = dueDateInput.value;
  
      if (taskText) {
        tasks.push({
          text: taskText,
          category,
          dueDate: dueDate || null,
          completed: false,
        });
        saveTasks();
        renderTasks();
        taskForm.reset();
      }
    });
  
    // Filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.category;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderTasks();
      });
    });
  
    // Initial render
    filterButtons[0].classList.add('active');
    renderTasks();
  });