var gGame
var gTimerInterval
var gSmiley = '😃'

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
    updateSmiley('😃')

    gBoard = buildBoard(false)
    updateLivesDisplay()
    renderBoard(gBoard)
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
    updateSmiley('🤯')
    setTimeout(() => {
        if (gGame.lives > 0) {
            updateSmiley('😃')
        }
    }, 1500)
    if (gGame.lives === 0) {
        gameOver(false)
        return
    }

    checkGameOver()
    showModal('You clicked a mine! One life down!')
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
    updateSmiley(isWin ? '😎' : '🤯')
    revealBoard()
    showModal(isWin ? 'You win! 🎉' : 'Game over! 💥')
}

function updateLivesDisplay() {
    var livesElement = document.getElementById('lives')
    var hearts = ''

    for (var i = 0; i < gGame.lives; i++) {
        hearts += '❤️'
    }

    livesElement.innerHTML = hearts
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