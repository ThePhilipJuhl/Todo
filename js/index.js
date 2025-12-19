// Folder and Task Management
let folders = [];
let folderColors = [
    { bg: '#d4a574', card: '#8b6f47' }, // Light brown (BONUS - FLEX)
    { bg: '#9ca3af', card: '#4b5563' }, // Gray (To do) - darker card
    { bg: '#3b82f6', card: '#1e3a8a' }, // Blue (Started) - darker card
    { bg: '#f472b6', card: '#be185d' }, // Pink - darker card
    { bg: '#a78bfa', card: '#6d28d9' }, // Purple - darker card
    { bg: '#34d399', card: '#047857' }, // Green - darker card
];

// LocalStorage functions for folders
function saveFolders() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

function loadFolders() {
    const savedFolders = localStorage.getItem('folders');
    if (savedFolders) {
        folders = JSON.parse(savedFolders);
        renderFolders();
    }
}

// Animation functions (keeping existing)
function showXP(x, y, amount) {
    const xpText = document.createElement('div');
    xpText.className = 'xp-text';
    xpText.textContent = `XP+${amount}`;
    
    xpText.style.left = x + 'px';
    xpText.style.top = y + 'px';
    xpText.style.transform = 'translate(-50%, -50%)';
    xpText.style.opacity = '1';
    xpText.style.scale = '1';
    
    document.body.appendChild(xpText);
    
    let startTime = null;
    const duration = 1000;
    const moveDistance = -60;
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 2);
        const currentY = moveDistance * easeOut;
        const opacity = 1 - progress;
        const scale = 1 + progress * 0.5;
        
        xpText.style.transform = `translate(-50%, calc(-50% + ${currentY}px)) scale(${scale})`;
        xpText.style.opacity = opacity;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            xpText.remove();
        }
    }
    
    requestAnimationFrame(animate);
}

function createExplosion(x, y) {
    const colors = ['#f093fb', '#4facfe', '#667eea', '#764ba2', '#ff6b6b', '#ffd93d', '#6bcf7f'];
    const particleCount = 20;
    const container = document.createElement('div');
    container.className = 'explosion-container';
    document.body.appendChild(container);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'explosion-particle';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const velocity = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.opacity = '1';
        
        let startTime = null;
        const duration = 800;
        
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentX = tx * easeOut;
            const currentY = ty * easeOut;
            const scale = 1 - easeOut;
            const opacity = 1 - easeOut;
            
            particle.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${scale})`;
            particle.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animate);
        container.appendChild(particle);
    }
    
    setTimeout(() => {
        if (container.parentNode) {
            container.remove();
        }
    }, 850);
}

// Create a new folder
function createFolder(name = null) {
    const folderName = name || prompt('Enter folder name:') || `Folder ${folders.length + 1}`;
    const colorIndex = folders.length % folderColors.length;
    const color = folderColors[colorIndex];
    
    const folder = {
        id: Date.now().toString(),
        name: folderName,
        tasks: [],
        color: color,
        order: folders.length
    };
    
    folders.push(folder);
    saveFolders();
    renderFolders();
    return folder;
}

// Create task element within a folder
function createTaskElement(folderId, taskText, isChecked = false) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const task = {
        id: Date.now().toString(),
        text: taskText,
        checked: isChecked
    };
    
    folder.tasks.push(task);
    saveFolders();
    renderFolder(folder);
}

// Delete task from folder
function deleteTask(folderId, taskId, x = null, y = null) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const task = folder.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Show XP if task is completed
    if (task.checked) {
        const letterCount = task.text.replace(/\s/g, '').length;
        
        // Use provided position, or fallback to folder center
        if (x === null || y === null) {
            const folderElement = document.querySelector(`[data-folder-id="${folderId}"]`);
            if (folderElement) {
                const rect = folderElement.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height / 2;
            } else {
                x = window.innerWidth / 2;
                y = window.innerHeight / 2;
            }
        }
        
        showXP(x, y, letterCount);
    }
    
    folder.tasks = folder.tasks.filter(t => t.id !== taskId);
    saveFolders();
    renderFolder(folder);
}

// Toggle task completion
function toggleTask(folderId, taskId) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const task = folder.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.checked = !task.checked;
    saveFolders();
    renderFolder(folder);
}

// Render a single folder
function renderFolder(folder) {
    const foldersList = document.getElementById('foldersList');
    let folderElement = document.querySelector(`[data-folder-id="${folder.id}"]`);
    
    if (!folderElement) {
        folderElement = document.createElement('div');
        folderElement.className = 'folder-item';
        folderElement.setAttribute('data-folder-id', folder.id);
        folderElement.style.minWidth = '280px';
        folderElement.style.maxWidth = '280px';
        foldersList.appendChild(folderElement);
    }
    
    folderElement.innerHTML = `
        <div class="folder-card" style="background-color: ${folder.color.bg};">
            <div class="folder-header">
                <div class="folder-title" style="background-color: ${folder.color.bg};">
                    <span>${folder.name}</span>
                    <span class="folder-count">${folder.tasks.length}</span>
                </div>
                <div class="folder-actions">
                    <button class="folder-move-btn" data-action="left" data-folder-id="${folder.id}" title="Move left">←</button>
                    <button class="folder-move-btn" data-action="right" data-folder-id="${folder.id}" title="Move right">→</button>
                    <button class="folder-delete-btn" data-folder-id="${folder.id}" title="Delete folder">×</button>
                </div>
            </div>
            <div class="folder-tasks">
                ${folder.tasks.map(task => `
                    <div class="task-card" style="background-color: ${folder.color.card};" data-task-id="${task.id}">
                        <input type="checkbox" class="task-checkbox" ${task.checked ? 'checked' : ''} 
                               data-folder-id="${folder.id}" data-task-id="${task.id}">
                        <span class="task-text ${task.checked ? 'completed' : ''}">${task.text}</span>
                        <button class="task-delete-btn" data-folder-id="${folder.id}" data-task-id="${task.id}">X</button>
                    </div>
                `).join('')}
            </div>
            <form class="folder-task-form" data-folder-id="${folder.id}">
                <input type="text" class="folder-task-input" placeholder="New page" 
                       style="background-color: ${folder.color.card};">
                <button type="submit" class="folder-task-submit" style="background-color: ${folder.color.card};">+</button>
            </form>
        </div>
    `;
    
    // Attach event listeners
    attachFolderEventListeners(folderElement, folder);
}

// Attach event listeners to folder elements
function attachFolderEventListeners(folderElement, folder) {
    // Task form submission
    const form = folderElement.querySelector('.folder-task-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.folder-task-input');
        const taskText = input.value.trim();
        if (taskText) {
            createTaskElement(folder.id, taskText);
            input.value = '';
        }
    });
    
    // Task checkboxes
    folderElement.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = this.getAttribute('data-task-id');
            const task = folder.tasks.find(t => t.id === taskId);
            
            if (this.checked && task) {
                const taskCard = this.closest('.task-card');
                const rect = taskCard.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Create explosion animation
                createExplosion(centerX, centerY);
            }
            
            // Toggle task state
            toggleTask(folder.id, taskId);
        });
    });
    
    // Task delete buttons
    folderElement.querySelectorAll('.task-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            const taskCard = this.closest('.task-card');
            
            // Get position and task data before animation starts
            const rect = taskCard.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const task = folder.tasks.find(t => t.id === taskId);
            
            taskCard.style.transition = 'all 0.3s ease';
            taskCard.style.opacity = '0';
            taskCard.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                deleteTask(folder.id, taskId, x, y);
            }, 300);
        });
    });
    
    // Folder delete button
    const deleteBtn = folderElement.querySelector('.folder-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm(`Delete folder "${folder.name}" and all its tasks?`)) {
                folders = folders.filter(f => f.id !== folder.id);
                saveFolders();
                folderElement.remove();
            }
        });
    }
    
    // Folder move buttons
    folderElement.querySelectorAll('.folder-move-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            moveFolder(folder.id, action);
        });
    });
}

// Move folder left or right
function moveFolder(folderId, direction) {
    const folderIndex = folders.findIndex(f => f.id === folderId);
    if (folderIndex === -1) return;
    
    if (direction === 'left' && folderIndex > 0) {
        [folders[folderIndex], folders[folderIndex - 1]] = [folders[folderIndex - 1], folders[folderIndex]];
        // Update order property
        folders.forEach((f, idx) => {
            f.order = idx;
        });
        saveFolders();
        renderFolders();
    } else if (direction === 'right' && folderIndex < folders.length - 1) {
        [folders[folderIndex], folders[folderIndex + 1]] = [folders[folderIndex + 1], folders[folderIndex]];
        // Update order property
        folders.forEach((f, idx) => {
            f.order = idx;
        });
        saveFolders();
        renderFolders();
    }
}

// Render all folders
function renderFolders() {
    const foldersList = document.getElementById('foldersList');
    foldersList.innerHTML = '';
    
    // Sort folders by order
    folders.sort((a, b) => a.order - b.order);
    
    folders.forEach(folder => {
        renderFolder(folder);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFolders();
    
    // Create folder button
    const createFolderBtn = document.getElementById('createFolderBtn');
    createFolderBtn.addEventListener('click', () => {
        createFolder();
    });
    
    // If no folders exist, create a default one
    if (folders.length === 0) {
        createFolder('To do');
    }
});
