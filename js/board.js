'use strict'

var gBoard
var gLevels = {
    beginner: { SIZE: 4, MINES: 2 },
    medium: { SIZE: 8, MINES: 14 },
    expert: { SIZE: 12, MINES: 32 }
}
var gLevel = gLevels.beginner

function onLevelChange() {
    var levelSelect = document.getElementById('level')
    var selectedLevel = levelSelect.value
    gLevel = gLevels[selectedLevel]
    startGame()
}

function buildBoard() {
    var board = createBoard(gLevel.SIZE)
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

        if (isCellSafeForMine(board, row, col, firstRow, firstCol)) {
            board[row][col].isMine = true
            minesPlaced++
        }
    }
}

function isCellSafeForMine(board, row, col, firstRow, firstCol) {
    return (
        !board[row][col].isMine &&
        !(row >= firstRow - 1 && row <= firstRow + 1 && col >= firstCol - 1 && col <= firstCol + 1)
    )
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