const gameBoard = document.getElementById('game-board');
const checkBtn = document.getElementById('check-btn');
const message = document.getElementById('message');

const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

function createBoard() {
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
                cell.appendChild(input);
            }
            gameBoard.appendChild(cell);
        }
    }
}

function checkSolution() {
    const inputs = document.querySelectorAll('input');
    const solution = JSON.parse(JSON.stringify(puzzle));

    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        solution[row][col] = parseInt(input.value) || 0;
    });

    if (isValidSolution(solution)) {
        message.textContent = 'Congratulations! Your solution is correct!';
        message.style.color = 'green';
    } else {
        message.textContent = 'Sorry, your solution is incorrect. Keep trying!';
        message.style.color = 'red';
    }
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

createBoard();
checkBtn.addEventListener('click', checkSolution);