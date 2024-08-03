const gameBoard = document.getElementById('game-board');
const checkBtn = document.getElementById('check-btn');
const solveBtn = document.getElementById('solve-btn');
const newGameBtn = document.getElementById('new-game-btn');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');
const message = document.getElementById('message');

let puzzle = [];
let solution = [];
let timer;
let seconds = 0;

const puzzles = {
    easy: [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ],
    medium: [
        [0,0,0,2,6,0,7,0,1],
        [6,8,0,0,7,0,0,9,0],
        [1,9,0,0,0,4,5,0,0],
        [8,2,0,1,0,0,0,4,0],
        [0,0,4,6,0,2,9,0,0],
        [0,5,0,0,0,3,0,2,8],
        [0,0,9,3,0,0,0,7,4],
        [0,4,0,0,5,0,0,3,6],
        [7,0,3,0,1,8,0,0,0]
    ],
    hard: [
        [0,0,0,6,0,0,4,0,0],
        [7,0,0,0,0,3,6,0,0],
        [0,0,0,0,9,1,0,8,0],
        [0,0,0,0,0,0,0,0,0],
        [0,5,0,1,8,0,0,0,3],
        [0,0,0,3,0,6,0,4,5],
        [0,4,0,2,0,0,0,6,0],
        [9,0,3,0,0,0,0,0,0],
        [0,2,0,0,0,0,1,0,0]
    ]
};

function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (puzzle[i][j] !== 0) {
                cell.textContent = puzzle[i][j];
            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 1;
                input.max = 9;
                input.addEventListener('input', highlightCells);
                cell.appendChild(input);
            }
            gameBoard.appendChild(cell);
        }
    }
}

function highlightCells(event) {
    const value = event.target.value;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('highlighted'));
    
    if (value) {
        cells.forEach(cell => {
            if (cell.textContent === value || (cell.firstChild && cell.firstChild.value === value)) {
                cell.classList.add('highlighted');
            }
        });
    }
}

function checkSolution() {
    const inputs = document.querySelectorAll('input');
    const currentSolution = JSON.parse(JSON.stringify(puzzle));

    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        currentSolution[row][col] = parseInt(input.value) || 0;
    });

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

function startNewGame() {
    const difficulty = difficultySelect.value;
    puzzle = JSON.parse(JSON.stringify(puzzles[difficulty]));
    solution = JSON.parse(JSON.stringify(puzzle));
    solve(solution);
    createBoard();
    message.textContent = '';
    resetTimer();
    startTimer();
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

checkBtn.addEventListener('click', checkSolution);
solveBtn.addEventListener('click', solvePuzzle);
newGameBtn.addEventListener('click', startNewGame);

startNewGame();