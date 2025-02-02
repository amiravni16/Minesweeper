'use strict'


function updateSmiley(smiley) {
    document.querySelector('.smiley').innerText = smiley
}

function renderBoard(board) {
    var table = document.getElementById('board')
    if (!table) return
    var size = board.length
    var html = ''

    for (var i = 0; i < size; i++) {
        html += '<tr>'
        for (var j = 0; j < size; j++) {
            var cell = board[i][j]
            var cellContent = cell.isMarked ? '🚩' : ''
            html += `
                <td 
                    data-row="${i}" 
                    data-col="${j}" 
                    class="${cell.isCovered ? 'covered' : 'uncovered'}" 
                    onclick="onCellClicked(this, ${i}, ${j})" 
                    oncontextmenu="onCellMarked(this); return false;"
                >
                    ${cellContent}
                </td>
            `
        }
        html += '</tr>'
    }

    table.innerHTML = html
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
        elCell.innerText = ''
        gGame.markedCount--
    } else {
        cell.isMarked = true
        elCell.classList.add('marked')
        elCell.innerText = '🚩'
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

                if (cell.isCovered && !cell.isMine && !cell.isMarked) {
                    uncoverCell(neighborCellEl, row, col)
                }
            }
        }
    }
    checkGameOver()
}

function showModal(message) {
    var modal = document.getElementById('modal')
    var modalMessage = document.getElementById('modal-message')
    modalMessage.innerText = message
    modal.style.display = 'flex'

    setTimeout(() => {
        closeModal()
    }, 1500)
}

function closeModal() {
    var modal = document.getElementById('modal')
    modal.style.display = 'none'
}
