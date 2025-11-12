document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault()

        const taskText = document.getElementById('taskInput').value.trim()
        console.log('submitted', taskText)

        if (taskText === '') {
            return
        }
        
        const taskList = document.getElementById('Tasklist')
        
        // creating a list item out from element
        const li = document.createElement('li')
        li.className = 'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-pink-100 via-purple-100 to-cyan-100 border-2 border-black rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all'
        
        // checkbox logic with styling
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'w-5 h-5 sm:w-6 sm:h-6 accent-purple-600 cursor-pointer'
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                taskTextSpan.classList.add('line-through', 'opacity-60')
                li.classList.add('bg-gradient-to-r', 'from-gray-200', 'to-gray-300')
            } else {
                taskTextSpan.classList.remove('line-through', 'opacity-60')
                li.classList.remove('bg-gradient-to-r', 'from-gray-200', 'to-gray-300')
                li.classList.add('bg-gradient-to-r', 'from-pink-100', 'via-purple-100', 'to-cyan-100')
            }
        })
        
        // task text from element 
        const taskTextSpan = document.createElement('span')
        taskTextSpan.className = 'flex-1 text-black font-pixel text-sm sm:text-base'
        taskTextSpan.textContent = taskText
        
        // Delete button for task
        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-b from-red-400 to-red-600 border-2 border-black rounded text-white text-xs sm:text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] uppercase'
        deleteBtn.textContent = 'X'
        deleteBtn.addEventListener('click', function() {
            li.style.transition = 'all 0.3s ease'
            li.style.opacity = '0'
            li.style.transform = 'translateX(-20px)'
            setTimeout(() => {
                li.remove()
            }, 300)
        })
        
        li.appendChild(checkbox)
        li.appendChild(taskTextSpan)
        li.appendChild(deleteBtn)
        taskList.appendChild(li)

        document.getElementById('taskInput').value = ''
        document.getElementById('taskInput').focus()
    })
})