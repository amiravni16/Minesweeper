var gBoard
var gLevels = {
    beginner: { SIZE: 4, MINES: 4 },
    medium: { SIZE: 8, MINES: 14 },
    expert: { SIZE: 12, MINES: 32 }
}
var gLevel = gLevels.beginner
var gGame
var gTimerInterval

function onInit() {
    gLevel = gLevels.beginner
    startGame()
}

function startGame() {
    gGame = {
        isOn: true,
        coveredCount: gLevel.SIZE * gLevel.SIZE,
        markedCount: 0,
        secsPassed: 0,
        millisecondsPassed: 0,
        lives: 3,
        isFirstClick: true
    }

    clearInterval(gTimerInterval)
    gTimerInterval = null
    document.getElementById('timer').innerText = 'Time: 0.000'

    gBoard = buildBoard(false)
    updateLivesDisplay()
    renderBoard(gBoard)
}

function updateLivesDisplay() {
    document.getElementById('lives').innerText = gGame.lives
}

function onLevelChange() {
    var level = document.getElementById('level').value
    gLevel = gLevels[level]
    startGame()
}

function buildBoard(placeMinesInitially) {
    var board = createBoard(gLevel.SIZE)
    if (placeMinesInitially) {
        placeMines(board, gLevel.MINES)
    }
    setMinesNegsCount(board)
    return board
}

function createBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isCovered: true,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function placeMinesAfterFirstClick(board, firstRow, firstCol) {
    var size = board.length
    var minesPlaced = 0

    while (minesPlaced < gLevel.MINES) {
        var row = Math.floor(Math.random() * size)
        var col = Math.floor(Math.random() * size)

        if (
            !board[row][col].isMine &&
            !(row >= firstRow - 1 && row <= firstRow + 1 && col >= firstCol - 1 && col <= firstCol + 1)
        ) {
            board[row][col].isMine = true
            minesPlaced++
        }
    }
}

function setMinesNegsCount(board) {
    var size = board.length
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countMinesAround(board, i, j)
            }
        }
    }
}

function countMinesAround(board, row, col) {
    var count = 0
    var size = board.length
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size && board[i][j].isMine) {
                count++
            }
        }
    }
    return count
}

function renderBoard(board) {
    var table = document.getElementById('board')
    if (!table) return
    var size = board.length
    var html = ''

    for (var i = 0; i < size; i++) {
        html += '<tr>'
        for (var j = 0; j < size; j++) {
            html += `
                <td 
                    data-row="${i}" 
                    data-col="${j}" 
                    class="covered" 
                    onclick="onCellClicked(this, ${i}, ${j})" 
                    oncontextmenu="onCellMarked(this); return false;"
                >
                </td>
            `
        }
        html += '</tr>'
    }

    table.innerHTML = html
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (gGame.isFirstClick) {
        gGame.isFirstClick = false

        gTimerInterval = setInterval(() => {
            gGame.millisecondsPassed += 10
            if (gGame.millisecondsPassed >= 1000) {
                gGame.secsPassed++
                gGame.millisecondsPassed = 0
            }
            document.getElementById('timer').innerText = `Time: ${gGame.secsPassed}.${String(gGame.millisecondsPassed).padStart(3, '0')}`
        }, 10)

        placeMinesAfterFirstClick(gBoard, i, j)
        setMinesNegsCount(gBoard)
    }

    var cell = gBoard[i][j]

    if (cell.isMine) {
        handleMineClick(elCell, i, j)
    } else {
        uncoverCell(elCell, i, j)
        checkGameOver()
    }
}

function handleMineClick(elCell, i, j) {
    gGame.lives--
    updateLivesDisplay()
    elCell.classList.remove('covered')
    elCell.classList.add('mine')
    elCell.innerText = '💣'

    if (gGame.lives === 0) {
        gameOver(false)
        return
    }

    checkGameOver()
    alert('You clicked a mine! One life down!')
}

function onCellMarked(elCell) {
    if (!gGame.isOn) return

    var i = parseInt(elCell.dataset.row)
    var j = parseInt(elCell.dataset.col)
    var cell = gBoard[i][j]

    if (!cell.isCovered) return

    if (cell.isMarked) {
        cell.isMarked = false
        elCell.classList.remove('marked')
        gGame.markedCount--
    } else {
        cell.isMarked = true
        elCell.classList.add('marked')
        gGame.markedCount++
    }
}

function uncoverCell(elCell, i, j) {
    var cell = gBoard[i][j]

    if (cell.isCovered && !cell.isMarked) {
        cell.isCovered = false
        elCell.classList.remove('covered')
        elCell.classList.add('uncovered')
        elCell.innerText = cell.minesAroundCount || ''
        gGame.coveredCount--

        if (cell.minesAroundCount === 0) {
            expandUncover(gBoard, elCell, i, j)
        }
    }
}

function expandUncover(board, neighborCell, i, j) {
    var size = board.length

    for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
            if (row >= 0 && row < size && col >= 0 && col < size) {
                if (row === i && col === j) continue

                var cell = board[row][col]
                var neighborCellEl = document.querySelector(
                    `td[data-row='${row}'][data-col='${col}']`
                )

                if (cell.isCovered && !cell.isMine) {
                    uncoverCell(neighborCellEl, row, col)
                }
            }
        }
    }
    checkGameOver()
}

function checkGameOver() {
    var totalCells = gLevel.SIZE * gLevel.SIZE
    var nonMineCells = totalCells - gLevel.MINES

    if (gGame.coveredCount === gLevel.MINES) {
        gameOver(true)
    }
}

function gameOver(isWin) {
    gGame.isOn = false

    clearInterval(gTimerInterval)

    revealBoard()
    alert(isWin ? 'You win! 🎉' : 'Game over! 💥')
}

function revealBoard() {
    var size = gBoard.length
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var cell = gBoard[i][j]
            var elCell = document.querySelector(`td[data-row='${i}'][data-col='${j}']`)
            if (cell.isMine) {
                elCell.classList.remove('covered')
                elCell.classList.add('mine')
                elCell.innerText = '💣'
            } else if (cell.isCovered) {
                elCell.classList.remove('covered')
                elCell.classList.add('uncovered')
                elCell.innerText = cell.minesAroundCount || ''
            }
        }
    }
}