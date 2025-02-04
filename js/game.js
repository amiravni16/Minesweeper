'use strict'

var gGame
var gTimerInterval
var gSmiley = '😃'
var gHint = {
    isHintActive: false,
    hintsRemaining: 3
}


function onInit() {
    gLevel = gLevels.beginner
    initTheme()
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
        isFirstClick: true,
    }
    
    resetHints()

    clearInterval(gTimerInterval)
    gTimerInterval = null
    document.getElementById('timer').innerText = 'Time: 0.000'
    updateSmiley('😃')

    gBoard = buildBoard()
    updateLivesDisplay()
    renderBoard(gBoard)
    updateBestScore()
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (gHint.isHintActive) {
        useHint(i, j)
        return
    }

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
    if (gGame.coveredCount === gLevel.MINES) {
        gameOver(true)
    }
}

function gameOver(isWin) {
    gGame.isOn = false
    clearInterval(gTimerInterval)
    updateSmiley(isWin ? '😎' : '🤯')
    revealBoard()
    if (isWin) saveBestScore()
    showModal(isWin ? 'You win! 🎉' : 'Game over! 💥')
}

function updateLivesDisplay() {
    var livesElement = document.getElementById('hearts')
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

function resetHints() {
    gHint.isHintActive = false
    gHint.hintsRemaining = 3
    const hints = document.querySelectorAll('.hint')
    hints.forEach(hint => {
        hint.classList.remove('active', 'used')
    })
}

function onHintClick(elHint) {
    if (!gGame.isOn || elHint.classList.contains('used')) return
    
    if (gHint.isHintActive) {
        
        const activeHint = document.querySelector('.hint.active')
        if (activeHint) {
            activeHint.classList.remove('active')
        }
        gHint.isHintActive = false
    } else {
        
        elHint.classList.add('active')
        gHint.isHintActive = true
    }
}

function useHint(row, col) {
    const activeHint = document.querySelector('.hint.active')
    if (!activeHint) return

    activeHint.classList.remove('active')
    activeHint.classList.add('used')
    gHint.isHintActive = false
    gHint.hintsRemaining--

   
    const revealedCells = []
    
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < gBoard.length && j >= 0 && j < gBoard[0].length) {
                const cell = gBoard[i][j]
                const elCell = document.querySelector(`td[data-row='${i}'][data-col='${j}']`)
                
                if (cell.isCovered && !cell.isMarked) {
                    revealedCells.push({
                        element: elCell,
                        content: cell.isMine ? '💣' : (cell.minesAroundCount || '')
                    })
                    
                    elCell.classList.add('cell-hint')
                    elCell.innerText = cell.isMine ? '💣' : (cell.minesAroundCount || '')
                }
            }
        }
    }

    setTimeout(() => {
        revealedCells.forEach(({element, content}) => {
            element.classList.remove('cell-hint')
            if (element.classList.contains('covered')) {
                element.innerText = ''
            }
        })
    }, 1500)
}

function saveBestScore() {
    const currentLevel = document.getElementById('level').value
    const currentTime = gGame.secsPassed + (gGame.millisecondsPassed / 1000)
    const bestScore = localStorage.getItem(`bestScore_${currentLevel}`)
    
    if (!bestScore || currentTime < parseFloat(bestScore)) {
        localStorage.setItem(`bestScore_${currentLevel}`, currentTime.toFixed(3))
        updateBestScore()
    }
}

function updateBestScore() {
    const currentLevel = document.getElementById('level').value
    const bestScore = localStorage.getItem(`bestScore_${currentLevel}`)
    const bestScoreElement = document.getElementById('best-score')
    bestScoreElement.innerText = bestScore ? `${bestScore}s` : '-'
}


function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
    updateThemeButton(savedTheme)
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    updateThemeButton(newTheme)
}

function updateThemeButton(theme) {
    const button = document.getElementById('theme-toggle')
    button.textContent = theme === 'dark' ? '🌜' : '🌞'
}