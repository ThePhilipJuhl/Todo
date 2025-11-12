


document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()

    const taskText = document.getElementById('taskInput').value
    console.log('submitted', taskText)

    if (taskText === '') {
        return
    }
    
    const taskList = document.getElementById('Tasklist')
    
    const li = document.createElement('li') 
    li.textContent = taskText
    taskList.appendChild(li)

    document.getElementById('taskInput').value = ''
})