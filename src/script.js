document.addEventListener('DOMContentLoaded', () => {
    const boardForm = document.getElementById('board-form');
    const boardInput = document.getElementById('board-input');
    const boardList = document.getElementById('board-list');
    const toggleNavButton = document.getElementById('toggle-nav');
    const navbar = document.querySelector('.navbar');
    const boardTitle = document.getElementById('board-title');
    const columnsDiv = document.getElementById('columns');
    const addCardButton = document.getElementById('add-card');

    let boards = {};
    let currentBoard = 'Default';

    function renderBoards() {
        boardList.innerHTML = '';
        for (const board in boards) {
            const li = document.createElement('li');
            li.textContent = board;
            li.addEventListener('click', () => {
                switchBoard(board);
            });

            const editButton = document.createElement('button');
            editButton.textContent = '✎';
            editButton.classList.add('edit-board');
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const newName = prompt('Enter new board name', board);
                if (newName && newName !== board) {
                    boards[newName] = boards[board];
                    delete boards[board];
                    renderBoards();
                    switchBoard(newName);
                }
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑';
            deleteButton.classList.add('delete-board');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm(`Are you sure you want to delete the board "${board}"?`)) {
                    delete boards[board];
                    renderBoards();
                    if (currentBoard === board) {
                        switchBoard('Default');
                    }
                }
            });

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            boardList.appendChild(li);
        }
    }

    function switchBoard(board) {
        currentBoard = board;
        boardTitle.textContent = `${board} To-Do List`;
        renderColumns();
    }

    function renderColumns() {
        columnsDiv.innerHTML = '';
        boards[currentBoard].forEach((column, columnIndex) => {
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('column');

            const columnHeader = document.createElement('div');
            columnHeader.classList.add('column-header');

            const columnTitle = document.createElement('div');
            columnTitle.classList.add('column-title');
            columnTitle.textContent = column.title || `Column ${columnIndex + 1}`;

            const editButton = document.createElement('button');
            editButton.textContent = '✎';
            editButton.classList.add('edit-column');
            editButton.addEventListener('click', () => {
                const newTitle = prompt('Enter new column title', column.title || `Column ${columnIndex + 1}`);
                if (newTitle) {
                    column.title = newTitle;
                    renderColumns();
                }
            });

            // Add the right-click event listener to the column header
            columnHeader.addEventListener('contextmenu', (event) => {
                showContextMenu(columnIndex, event);
            });

            columnHeader.appendChild(columnTitle);
            columnHeader.appendChild(editButton);
            columnDiv.appendChild(columnHeader);

            const todoForm = document.createElement('form');
            todoForm.classList.add('todo-form');
            todoForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const todoInput = todoForm.querySelector('.todo-input');
                addTask(columnIndex, todoInput.value);
                todoInput.value = '';
            });

            const todoInput = document.createElement('input');
            todoInput.type = 'text';
            todoInput.classList.add('todo-input');
            todoInput.placeholder = 'Enter a new task';
            todoInput.required = true;

            const addButton = document.createElement('button');
            addButton.type = 'submit';
            addButton.textContent = '+';

            todoForm.appendChild(todoInput);
            todoForm.appendChild(addButton);

            const todoList = document.createElement('ul');
            todoList.classList.add('todo-list');
            column.tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.text;
                if (task.achieved) {
                    li.classList.add('achieved');
                }

                const achieveButton = document.createElement('button');
                achieveButton.textContent = '✔';
                achieveButton.classList.add('achieve-button');
                achieveButton.addEventListener('click', () => {
                    task.achieved = !task.achieved;
                    renderColumns();
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    const index = column.tasks.indexOf(task);
                    if (index > -1) {
                        column.tasks.splice(index, 1);
                        renderColumns();
                    }
                });

                li.appendChild(achieveButton);
                li.appendChild(deleteButton);
                todoList.appendChild(li);
            });

            columnDiv.appendChild(todoList);
            columnDiv.appendChild(todoForm);
            columnsDiv.appendChild(columnDiv);
        });
    }

    function addTask(columnIndex, task) {
        boards[currentBoard][columnIndex].tasks.push({ text: task, achieved: false });
        renderColumns();
    }

    function addColumn() {
        boards[currentBoard].push({ title: `Column ${boards[currentBoard].length + 1}`, tasks: [] });
        renderColumns();
    }

    function deleteColumn(columnIndex) {
        boards[currentBoard].splice(columnIndex, 1);
        renderColumns();
    }

    boardForm.addEventListener('submit', event => {
        event.preventDefault();
        const newBoard = boardInput.value;
        if (!boards[newBoard]) {
            boards[newBoard] = [{ title: `Column 1`, tasks: [] }];
            boardInput.value = '';
            renderBoards();
            switchBoard(newBoard);
        }
    });

    toggleNavButton.addEventListener('click', () => {
        navbar.classList.toggle('navbar-collapsed');
    });

    addCardButton.addEventListener('click', addColumn);

    // Initialize with default board
    boards['Default'] = [{ title: 'Column 1', tasks: [] }];
    renderBoards();
    switchBoard('Default');
});

function showContextMenu(columnIndex, event) {
    // Prevent the default context menu from appearing
    event.preventDefault();

    // Remove any existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        document.body.removeChild(existingMenu);
    }

    // Create the context menu
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;

    // Create the delete option
    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete Column';
    deleteOption.classList.add('context-menu-option');
    deleteOption.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete this column?`)) {
            deleteColumn(columnIndex);
        }
        if (document.body.contains(contextMenu)) {
            document.body.removeChild(contextMenu);
        }
    });

    contextMenu.appendChild(deleteOption);

    // Add the context menu to the body
    document.body.appendChild(contextMenu);

    // Remove the context menu when clicking outside of it
    document.addEventListener('click', function handleClickOutside(event) {
        if (!contextMenu.contains(event.target)) {
            if (document.body.contains(contextMenu)) {
                document.body.removeChild(contextMenu);
            }
            document.removeEventListener('click', handleClickOutside);
        }
    });
}
