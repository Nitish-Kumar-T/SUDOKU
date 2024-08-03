const gameBoard = document.getElementById('game-board');
const checkBtn = document.getElementById('check-btn');
const solveBtn = document.getElementById('solve-btn');
const newGameBtn = document.getElementById('new-game-btn');
const hintBtn = document.getElementById('hint-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const pencilBtn = document.getElementById('pencil-btn');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');
const message = document.getElementById('message');
const mistakesDisplay = document.getElementById('mistakes');
const darkModeBtn = document.getElementById('dark-mode-btn');

let puzzle = [];
let solution = [];
let timer;
let seconds = 0;
let pencilMode = false;
let selectedCell = null;
let history = [];
let historyIndex = -1;
let mistakes = 0;
const maxMistakes = 3;
let darkMode = false;
let hintsUsed = 0;

const difficulties = {
    easy: { emptySquares: 30, maxHints: 5 },
    medium: { emptySquares: 40, maxHints: 3 },
    hard: { emptySquares: 50, maxHints: 1 },
    expert: { emptySquares: 60, maxHints: 0 }
};

function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if ((Math.floor(i / 3) + Math.floor(j / 3)) % 2 === 0) {
                cell.classList.add('alternate-color');
            }
            if (puzzle[i][j] !== 0) {
                cell.textContent = puzzle[i][j];
                cell.classList.add('initial');
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.addEventListener('input', handleInput);
                input.addEventListener('focus', () => selectCell(cell));
                cell.appendChild(input);
            }
            cell.addEventListener('click', () => selectCell(cell));
            gameBoard.appendChild(cell);
        }
    }
}

function handleInput(event) {
    const input = event.target;
    const value = input.value;
    const cell = input.parentElement;
    const index = Array.from(gameBoard.children).indexOf(cell);
    const row = Math.floor(index / 9);
    const col = index % 9;

    if (value !== '' && (isNaN(value) || value < 1 || value > 9)) {
        input.value = '';
    } else if (pencilMode) {
        updatePencilNotes(cell, value);
        input.value = '';
    } else {
        clearPencilNotes(cell);
        if (value !== '' && parseInt(value) !== solution[row][col]) {
            mistakes++;
            updateMistakesDisplay();
            cell.classList.add('mistake');
            if (mistakes >= maxMistakes) {
                gameOver();
            }
        } else {
            cell.classList.remove('mistake');
        }
        addToHistory();
    }
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('highlighted');
    }
    selectedCell = cell;
    cell.classList.add('highlighted');
}

function updatePencilNotes(cell, value) {
    let pencilNotes = cell.querySelector('.pencil-notes');
    if (!pencilNotes) {
        pencilNotes = document.createElement('div');
        pencilNotes.classList.add('pencil-notes');
        cell.appendChild(pencilNotes);
    }

    const noteElement = pencilNotes.querySelector(`.pencil-note:nth-child(${value})`);
    if (noteElement) {
        noteElement.remove();
    } else {
        const note = document.createElement('div');
        note.classList.add('pencil-note');
        note.textContent = value;
        pencilNotes.appendChild(note);
    }
}

function clearPencilNotes(cell) {
    const pencilNotes = cell.querySelector('.pencil-notes');
    if (pencilNotes) {
        pencilNotes.remove();
    }
}

function addToHistory() {
    const currentState = getBoardState();
    history = history.slice(0, historyIndex + 1);
    history.push(currentState);
    historyIndex++;
    updateUndoRedoButtons();
}

function getBoardState() {
    const state = [];
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.textContent) {
            state.push(parseInt(cell.textContent));
        } else if (cell.firstChild && cell.firstChild.tagName === 'INPUT') {
            state.push(parseInt(cell.firstChild.value) || 0);
        } else {
            state.push(0);
        }
    });
    return state;
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreBoardState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreBoardState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

function restoreBoardState(state) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        if (cell.firstChild && cell.firstChild.tagName === 'INPUT') {
            cell.firstChild.value = state[index] || '';
        }
    });
}

function togglePencilMode() {
    pencilMode = !pencilMode;
    pencilBtn.classList.toggle('active');
}

function getHint() {
    if (!selectedCell) {
        message.textContent = 'Please select a cell first.';
        return;
    }

    const difficulty = difficultySelect.value;
    const maxHints = difficulties[difficulty].maxHints;

    if (hintsUsed >= maxHints) {
        message.textContent = `No more hints available in ${difficulty} mode.`;
        return;
    }

    const row = Math.floor(Array.from(gameBoard.children).indexOf(selectedCell) / 9);
    const col = Array.from(gameBoard.children).indexOf(selectedCell) % 9;

    if (puzzle[row][col] !== 0) {
        message.textContent = 'This cell is already filled.';
        return;
    }

    selectedCell.querySelector('input').value = solution[row][col];
    selectedCell.classList.add('fade-in');
    setTimeout(() => selectedCell.classList.remove('fade-in'), 500);
    addToHistory();

    hintsUsed++;
    updateHintButton();
}

function updateHintButton() {
    const difficulty = difficultySelect.value;
    const maxHints = difficulties[difficulty].maxHints;
    hintBtn.textContent = `Hint (${maxHints - hintsUsed})`;
    if (hintsUsed >= maxHints) {
        hintBtn.disabled = true;
    }
}

function checkSolution() {
    const currentState = getBoardState();
    const currentSolution = [];
    for (let i = 0; i < 9; i++) {
        currentSolution.push(currentState.slice(i * 9, (i + 1) * 9));
    }

    if (isValidSolution(currentSolution)) {
        message.textContent = 'Congratulations! Your solution is correct!';
        message.style.color = 'green';
        stopTimer();
    } else {
        message.textContent = 'Sorry, your solution is incorrect. Keep trying!';
        message.style.color = 'red';
    }
}

function solvePuzzle() {
    if (solve(puzzle)) {
        updateBoard();
        message.textContent = 'Puzzle solved!';
        message.style.color = 'green';
        stopTimer();
    } else {
        message.textContent = 'This puzzle has no solution.';
        message.style.color = 'red';
    }
}

function solve(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solve(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
        if (board[Math.floor(row / 3) * 3 + Math.floor(i / 3)][Math.floor(col / 3) * 3 + i % 3] === num) return false;
    }
    return true;
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        if (cell.firstChild && cell.firstChild.tagName === 'INPUT') {
            cell.firstChild.value = puzzle[row][col];
        } else {
            cell.textContent = puzzle[row][col];
        }
    });
}

function isValidSolution(board) {
    for (let i = 0; i < 9; i++) {
        if (!isValidRow(board, i) || !isValidColumn(board, i) || !isValidBox(board, i)) {
            return false;
        }
    }
    return true;
}

function isValidRow(board, row) {
    const set = new Set();
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === 0) return false;
        if (set.has(board[row][i])) return false;
        set.add(board[row][i]);
    }
    return true;
}

function isValidColumn(board, col) {
    const set = new Set();
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === 0) return false;
        if (set.has(board[i][col])) return false;
        set.add(board[i][col]);
    }
    return true;
}

function isValidBox(board, box) {
    const set = new Set();
    const rowStart = Math.floor(box / 3) * 3;
    const colStart = (box % 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const value = board[rowStart + i][colStart + j];
            if (value === 0) return false;
            if (set.has(value)) return false;
            set.add(value);
        }
    }
    return true;
}

function generatePuzzle(difficulty) {
    const emptySquares = difficulties[difficulty].emptySquares;
    const fullBoard = generateSolvedBoard();
    const puzzle = JSON.parse(JSON.stringify(fullBoard));

    let emptied = 0;
    while (emptied < emptySquares) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            emptied++;
        }
    }

    return { puzzle, solution: fullBoard };
}

function generateSolvedBoard() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    solve(board);
    return board;
}

function startNewGame() {
    const difficulty = difficultySelect.value;
    const generated = generatePuzzle(difficulty);
    puzzle = generated.puzzle;
    solution = generated.solution;
    createBoard();
    message.textContent = '';
    resetTimer();
    startTimer();
    mistakes = 0;
    updateMistakesDisplay();
    history = [];
    historyIndex = -1;
    updateUndoRedoButtons();
    hintBtn.disabled = false;
    hintsUsed = 0;
    updateHintButton();
}

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateMistakesDisplay() {
    mistakesDisplay.textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
}

function gameOver() {
    message.textContent = 'Game Over! You\'ve made too many mistakes.';
    message.style.color = 'red';
    stopTimer();
    gameBoard.classList.add('game-over');
    disableInputs();
}

function disableInputs() {
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    darkModeBtn.textContent = darkMode ? 'Light Mode' : 'Dark Mode';
}


function handleKeyDown(event) {
    if (!selectedCell) return;

    const key = event.key;
    const input = selectedCell.querySelector('input');

    if (key >= '1' && key <= '9') {
        if (pencilMode) {
            updatePencilNotes(selectedCell, key);
        } else {
            input.value = key;
            handleInput({ target: input });
        }
    } else if (key === 'Backspace' || key === 'Delete') {
        input.value = '';
        clearPencilNotes(selectedCell);
        addToHistory();
    } else if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
        event.preventDefault();
        moveSelection(key);
    }
}

function moveSelection(direction) {
    const currentIndex = Array.from(gameBoard.children).indexOf(selectedCell);
    let newIndex;

    switch (direction) {
        case 'ArrowLeft':
            newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
            break;
        case 'ArrowRight':
            newIndex = currentIndex < 80 ? currentIndex + 1 : currentIndex;
            break;
        case 'ArrowUp':
            newIndex = currentIndex - 9 >= 0 ? currentIndex - 9 : currentIndex;
            break;
        case 'ArrowDown':
            newIndex = currentIndex + 9 < 81 ? currentIndex + 9 : currentIndex;
            break;
    }

    if (newIndex !== currentIndex) {
        selectCell(gameBoard.children[newIndex]);
    }
}

checkBtn.addEventListener('click', checkSolution);
solveBtn.addEventListener('click', solvePuzzle);
newGameBtn.addEventListener('click', startNewGame);
hintBtn.addEventListener('click', getHint);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
pencilBtn.addEventListener('click', togglePencilMode);
darkModeBtn.addEventListener('click', toggleDarkMode);
difficultySelect.addEventListener('change', startNewGame);
document.addEventListener('keydown', handleKeyDown);

startNewGame();