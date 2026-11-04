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

// Deadlines
function isOverdue(task) {
    return !!task.due && !task.checked && Date.now() > task.due;
}

function formatDuration(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${Math.max(0, Math.floor(ms / 1000))}s`;
}

function formatDue(task) {
    const diff = task.due - Date.now();
    if (task.checked) return `⏰ ${new Date(task.due).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`;
    if (diff >= 0) return `⏰ in ${formatDuration(diff)}`;
    return `⚠ ${formatDuration(-diff)} late!`;
}

// "YYYY-MM-DDTHH:MM" in local time, for datetime-local inputs
function toDateTimeLocal(timestamp) {
    const d = new Date(timestamp);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Update countdowns and overdue glow in place (no re-render, so drags aren't interrupted)
function refreshDeadlines() {
    folders.forEach(folder => {
        // A minimized folder hides its tasks, so flag overdue ones on the header instead
        const folderEl = document.querySelector(`#foldersList .folder-item[data-folder-id="${folder.id}"]`);
        if (folderEl) folderEl.classList.toggle('has-overdue', folder.tasks.some(isOverdue));

        folder.tasks.forEach(task => {
            if (!task.due) return;
            const card = document.querySelector(`#foldersList .folder-item[data-folder-id="${folder.id}"] .task-card[data-task-id="${task.id}"]`);
            if (!card) return;
            card.classList.toggle('task-overdue', isOverdue(task));
            const label = card.querySelector('.task-due-label');
            if (label) label.textContent = formatDue(task);
        });
    });
}

function createConfetti(x, y) {
    const colors = ['#f472b6', '#a78bfa', '#22d3ee', '#ffd93d', '#6bcf7f', '#ff6b6b', '#ffffff'];
    const pieceCount = 40;
    const gravity = 0.25;
    const duration = 1400;

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (6 + Math.random() * 5) + 'px';
        piece.style.height = (Math.random() < 0.5 ? 4 : 10) + Math.random() * 4 + 'px';
        if (Math.random() < 0.25) piece.style.borderRadius = '50%';
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
        document.body.appendChild(piece);

        // Shoot mostly upwards in a fan, then fall with gravity
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
        const speed = 6 + Math.random() * 7;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        let px = 0;
        let py = 0;
        let rotation = Math.random() * 360;
        const spin = (Math.random() - 0.5) * 20;
        const wobble = Math.random() * Math.PI * 2;
        let startTime = null;

        function animate(time) {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const progress = elapsed / duration;

            vy += gravity;
            vx *= 0.98;
            vy *= 0.98;
            px += vx;
            py += vy;
            rotation += spin;

            // Flutter: squash on one axis to fake a 3D flip
            const flip = Math.cos(wobble + elapsed / 80);
            piece.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) rotate(${rotation}deg) scaleX(${flip})`;
            piece.style.opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                piece.remove();
            }
        }

        requestAnimationFrame(animate);
    }
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
function createTaskElement(folderId, taskText, isChecked = false, due = null) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const task = {
        id: Date.now().toString(),
        text: taskText,
        checked: isChecked,
        due: due
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
    folderElement.classList.toggle('minimized', !!folder.minimized);

    folderElement.innerHTML = `
        <div class="folder-card" style="background-color: ${folder.color.bg};">
            <div class="folder-header">
                <div class="folder-title" style="background-color: ${folder.color.bg};">
                    <span>${folder.name}</span>
                    <span class="folder-count">${folder.tasks.length}</span>
                </div>
                <div class="folder-actions">
                    <button class="folder-move-btn folder-minimize-btn" data-folder-id="${folder.id}" title="${folder.minimized ? 'Expand' : 'Minimize'}">${folder.minimized ? '▢' : '–'}</button>
                    <button class="folder-move-btn" data-action="left" data-folder-id="${folder.id}" title="Move left">←</button>
                    <button class="folder-move-btn" data-action="right" data-folder-id="${folder.id}" title="Move right">→</button>
                    <button class="folder-delete-btn" data-folder-id="${folder.id}" title="Delete folder">×</button>
                </div>
            </div>
            <div class="folder-tasks">
                ${folder.tasks.map(task => `
                    <div class="task-card ${isOverdue(task) ? 'task-overdue' : ''}" style="background-color: ${folder.color.card};" data-task-id="${task.id}">
                        <input type="checkbox" class="task-checkbox" ${task.checked ? 'checked' : ''}
                               data-folder-id="${folder.id}" data-task-id="${task.id}">
                        <div class="task-body">
                            <span class="task-text ${task.checked ? 'completed' : ''}">${task.text}</span>
                            ${task.due ? `<span class="task-due-label" title="Due ${new Date(task.due).toLocaleString()}">${formatDue(task)}</span>` : ''}
                        </div>
                        <span class="task-due-wrap">
                            <button type="button" class="task-due-btn ${task.due ? 'has-due' : ''}" title="${task.due ? 'Change deadline' : 'Set deadline'}">⏰</button>
                            <input type="datetime-local" class="task-due-input" tabindex="-1" value="${task.due ? toDateTimeLocal(task.due) : ''}">
                        </span>
                        <button class="task-delete-btn" data-folder-id="${folder.id}" data-task-id="${task.id}">X</button>
                    </div>
                `).join('')}
            </div>
            <form class="folder-task-form" data-folder-id="${folder.id}">
                <div class="folder-task-row">
                    <input type="text" class="folder-task-input" placeholder="New page"
                           style="background-color: ${folder.color.card};">
                    <button type="button" class="folder-due-toggle" title="Add a deadline" style="background-color: ${folder.color.card};">⏰</button>
                    <button type="submit" class="folder-task-submit" style="background-color: ${folder.color.card};">+</button>
                </div>
                <input type="datetime-local" class="folder-due-input" hidden
                       style="background-color: ${folder.color.card};">
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
        const dueInput = form.querySelector('.folder-due-input');
        const taskText = input.value.trim();
        if (taskText) {
            const due = dueInput.value ? new Date(dueInput.value).getTime() : null;
            createTaskElement(folder.id, taskText, false, due);
            input.value = '';

            // Confetti burst from the newly added task
            const newCard = document.querySelector(`.folder-item[data-folder-id="${folder.id}"] .task-card:last-child`);
            if (newCard) {
                newCard.scrollIntoView({ block: 'nearest' });
                newCard.classList.add('task-card-new');
                const rect = newCard.getBoundingClientRect();
                createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        }
    });
    
    // Show/hide the deadline picker in the new-task form
    const dueToggle = form.querySelector('.folder-due-toggle');
    const formDueInput = form.querySelector('.folder-due-input');
    dueToggle.addEventListener('click', () => {
        formDueInput.hidden = !formDueInput.hidden;
        dueToggle.classList.toggle('active', !formDueInput.hidden);
        if (formDueInput.hidden) {
            formDueInput.value = '';
        } else {
            formDueInput.focus();
            try { formDueInput.showPicker(); } catch (err) { /* not supported */ }
        }
    });

    // Set / change / clear the deadline on an existing task
    folderElement.querySelectorAll('.task-card').forEach(card => {
        const taskId = card.getAttribute('data-task-id');
        const btn = card.querySelector('.task-due-btn');
        const picker = card.querySelector('.task-due-input');
        btn.addEventListener('click', () => {
            try {
                picker.showPicker();
            } catch (err) {
                picker.focus();
                picker.click();
            }
        });
        picker.addEventListener('change', () => {
            const task = folder.tasks.find(t => t.id === taskId);
            if (!task) return;
            task.due = picker.value ? new Date(picker.value).getTime() : null;
            saveFolders();
            renderFolder(folder);
        });
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
    
    // Drag to reorder tasks
    folderElement.querySelectorAll('.task-card').forEach(card => {
        enableTaskDrag(card, folder, folderElement);
    });

    // Drag to reorder folders (grab the header)
    enableFolderDrag(folderElement);

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
    
    // Minimize / expand folder
    const minimizeBtn = folderElement.querySelector('.folder-minimize-btn');
    minimizeBtn.addEventListener('click', () => {
        folder.minimized = !folder.minimized;
        folderElement.classList.toggle('minimized', folder.minimized);
        minimizeBtn.textContent = folder.minimized ? '▢' : '–';
        minimizeBtn.title = folder.minimized ? 'Expand' : 'Minimize';

        // Wiggle on expand too (minimize gets it via the .minimized class)
        folderElement.classList.remove('just-expanded');
        if (!folder.minimized) {
            void folderElement.offsetWidth; // restart animation
            folderElement.classList.add('just-expanded');
            const onEnd = (ev) => {
                if (ev.target !== folderElement) return; // ignore child animations
                folderElement.classList.remove('just-expanded');
                folderElement.removeEventListener('animationend', onEnd);
            };
            folderElement.addEventListener('animationend', onEnd);
        }
        saveFolders();
        refreshDeadlines();
    });

    // Folder move buttons
    folderElement.querySelectorAll('.folder-move-btn[data-action]').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            moveFolder(folder.id, action);
        });
    });
}

// Drag & drop reordering of tasks within a folder
const HOLD_DELAY = 200;      // ms to hold before the card lifts
const MOUSE_MOVE_START = 5;  // px a mouse can move to start dragging right away
const TOUCH_CANCEL = 10;     // px a finger can move before the hold is cancelled (lets the list scroll)

function enableTaskDrag(card, folder, folderElement) {
    enableHoldDrag(card, (x, y) => startDrag(card, folder, folderElement, y));
}

function enableFolderDrag(folderElement) {
    const handle = folderElement.querySelector('.folder-header');
    if (!handle) return;
    enableHoldDrag(handle, (x, y) => startFolderDrag(folderElement, x, y));
}

// Calls onStart(x, y) once the pointer has been held (or, for a mouse, moved)
function enableHoldDrag(handle, onStart) {
    handle.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('input, button')) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const isTouch = e.pointerType !== 'mouse';
        let started = false;

        const holdTimer = setTimeout(() => {
            started = true;
            onStart(startX, startY);
        }, HOLD_DELAY);

        function onMove(ev) {
            if (started) return;
            const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
            if (isTouch && dist > TOUCH_CANCEL) {
                cleanup();
            } else if (!isTouch && dist > MOUSE_MOVE_START) {
                clearTimeout(holdTimer);
                started = true;
                onStart(startX, startY);
            }
        }

        function cleanup() {
            clearTimeout(holdTimer);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', cleanup);
            window.removeEventListener('pointercancel', cleanup);
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', cleanup);
        window.addEventListener('pointercancel', cleanup);
    });
}

function startDrag(card, folder, folderElement, pointerStartY) {
    const list = folderElement.querySelector('.folder-tasks');
    const rect = card.getBoundingClientRect();
    const offsetY = pointerStartY - rect.top;

    // Floating copy that follows the pointer
    const ghost = card.cloneNode(true);
    ghost.classList.add('task-card-ghost');
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    document.body.appendChild(ghost);

    // Original stays in the list as the drop placeholder
    card.classList.add('task-card-placeholder');
    document.body.classList.add('is-dragging-task');

    const sweatTimer = setInterval(() => spawnSweatDrop(ghost), 280);
    spawnSweatDrop(ghost);

    let lastY = pointerStartY;
    let scrollFrame = null;

    function moveGhost(clientY) {
        lastY = clientY;
        ghost.style.top = (clientY - offsetY) + 'px';
        reorderPlaceholder(clientY);
    }

    function reorderPlaceholder(clientY) {
        const siblings = [...list.querySelectorAll('.task-card:not(.task-card-placeholder)')];
        const before = siblings.find(el => {
            const r = el.getBoundingClientRect();
            return clientY < r.top + r.height / 2;
        });
        const currentNext = card.nextElementSibling;
        if (before ? before === currentNext : currentNext === null) return;

        // FLIP: remember positions, move, then animate from old to new
        const firstRects = new Map(siblings.map(el => [el, el.getBoundingClientRect().top]));
        if (before) list.insertBefore(card, before);
        else list.appendChild(card);
        siblings.forEach(el => {
            const dy = firstRects.get(el) - el.getBoundingClientRect().top;
            if (!dy) return;
            el.style.transition = 'none';
            el.style.transform = `translateY(${dy}px)`;
            el.getBoundingClientRect();
            el.style.transition = 'transform 0.2s ease';
            el.style.transform = '';
        });
    }

    // Scroll the task list when dragging near its top/bottom edge
    function autoScroll() {
        const r = list.getBoundingClientRect();
        const edge = 40;
        if (lastY < r.top + edge) list.scrollTop -= 8;
        else if (lastY > r.bottom - edge) list.scrollTop += 8;
        reorderPlaceholder(lastY);
        scrollFrame = requestAnimationFrame(autoScroll);
    }
    scrollFrame = requestAnimationFrame(autoScroll);

    function onMove(ev) {
        moveGhost(ev.clientY);
    }

    function preventTouchScroll(ev) {
        ev.preventDefault();
    }

    function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        window.removeEventListener('touchmove', preventTouchScroll);
        clearInterval(sweatTimer);
        cancelAnimationFrame(scrollFrame);

        // Settle the ghost into the placeholder's spot
        const target = card.getBoundingClientRect();
        ghost.classList.add('task-card-ghost-drop');
        ghost.style.top = target.top + 'px';
        ghost.style.left = target.left + 'px';

        setTimeout(() => {
            ghost.remove();
            card.classList.remove('task-card-placeholder');
            document.body.classList.remove('is-dragging-task');
        }, 180);

        // Save new order from the DOM
        const order = [...list.querySelectorAll('.task-card')].map(el => el.getAttribute('data-task-id'));
        folder.tasks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        saveFolders();
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
}

function startFolderDrag(folderElement, pointerStartX, pointerStartY) {
    const list = document.getElementById('foldersList');
    const rect = folderElement.getBoundingClientRect();
    const offsetX = pointerStartX - rect.left;
    const offsetY = pointerStartY - rect.top;

    const ghost = folderElement.cloneNode(true);
    ghost.removeAttribute('data-folder-id');
    ghost.classList.add('folder-ghost');
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';

    // Nervous eyes peeking over the top of the folder
    const eyes = document.createElement('div');
    eyes.className = 'folder-eyes';
    eyes.innerHTML = `
        <div class="folder-eye"><div class="folder-pupil"></div></div>
        <div class="folder-eye"><div class="folder-pupil"></div></div>
    `;
    ghost.appendChild(eyes);
    document.body.appendChild(ghost);

    folderElement.classList.add('folder-placeholder');
    document.body.classList.add('is-dragging-task');

    const sweatTimer = setInterval(() => spawnSweatDrop(ghost), 280);
    spawnSweatDrop(ghost);

    let lastX = pointerStartX;
    let scrollFrame = null;

    function reorderPlaceholder(clientX) {
        const siblings = [...list.querySelectorAll('.folder-item:not(.folder-placeholder)')];
        const before = siblings.find(el => {
            const r = el.getBoundingClientRect();
            return clientX < r.left + r.width / 2;
        });
        const currentNext = folderElement.nextElementSibling;
        if (before ? before === currentNext : currentNext === null) return;

        const firstRects = new Map(siblings.map(el => [el, el.getBoundingClientRect().left]));
        if (before) list.insertBefore(folderElement, before);
        else list.appendChild(folderElement);
        siblings.forEach(el => {
            const dx = firstRects.get(el) - el.getBoundingClientRect().left;
            if (!dx) return;
            el.style.transition = 'none';
            el.style.transform = `translateX(${dx}px)`;
            el.getBoundingClientRect();
            el.style.transition = 'transform 0.25s ease';
            el.style.transform = '';
        });
    }

    // Scroll the folder row when dragging near its left/right edge
    function autoScroll() {
        const r = list.getBoundingClientRect();
        const edge = 60;
        if (lastX < r.left + edge) list.scrollLeft -= 10;
        else if (lastX > r.right - edge) list.scrollLeft += 10;
        reorderPlaceholder(lastX);
        scrollFrame = requestAnimationFrame(autoScroll);
    }
    scrollFrame = requestAnimationFrame(autoScroll);

    function onMove(ev) {
        lastX = ev.clientX;
        ghost.style.left = (ev.clientX - offsetX) + 'px';
        ghost.style.top = (ev.clientY - offsetY) + 'px';
        reorderPlaceholder(ev.clientX);
    }

    function preventTouchScroll(ev) {
        ev.preventDefault();
    }

    function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        window.removeEventListener('touchmove', preventTouchScroll);
        clearInterval(sweatTimer);
        cancelAnimationFrame(scrollFrame);

        // Settle into place, then close the eyes, then reveal the real folder
        const target = folderElement.getBoundingClientRect();
        ghost.classList.add('folder-ghost-drop');
        ghost.style.left = target.left + 'px';
        ghost.style.top = target.top + 'px';

        setTimeout(() => eyes.classList.add('closing'), 200);
        setTimeout(() => {
            ghost.remove();
            folderElement.classList.remove('folder-placeholder');
            document.body.classList.remove('is-dragging-task');
        }, 700);

        // Save new order from the DOM
        const order = [...list.querySelectorAll('.folder-item')].map(el => el.getAttribute('data-folder-id'));
        folders.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        folders.forEach((f, idx) => { f.order = idx; });
        saveFolders();
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
}

function spawnSweatDrop(ghost) {
    const r = ghost.getBoundingClientRect();
    const drop = document.createElement('div');
    drop.className = 'sweat-drop';
    const leftSide = Math.random() < 0.5;
    const x = leftSide ? r.left + 6 + Math.random() * 14 : r.right - 20 + Math.random() * 14;
    drop.style.left = x + 'px';
    drop.style.top = (r.top - 4 + Math.random() * 8) + 'px';
    drop.style.setProperty('--drift', `${(leftSide ? -1 : 1) * (6 + Math.random() * 10)}px`);
    document.body.appendChild(drop);
    drop.addEventListener('animationend', () => drop.remove());
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

    // Keep deadline countdowns and overdue warnings up to date
    setInterval(refreshDeadlines, 1000);

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
