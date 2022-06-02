
function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

const sizes = document.querySelector('.box')
const gameContainer = document.querySelector('.game-container')
const game = document.querySelector('.game')
const confetti = document.querySelector('.confetti')

const MOVE_UNIT = sizes.offsetWidth + 8

const activeBox = []

const currentGame = [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
]

const isEmpty = (()=> {
    const res = []
    for(let x = 0; x < 4; x++){
        for(let y = 0; y < 4; y++){
            res.push([x, y, true])
        }
    }
    return res
})() //[[x, y, isEmpty], [x, y, isEmpty], [x, y, isEmpty]...]


class PlayableBox extends HTMLElement {
    constructor () {
        super()
        this.attachShadow({mode:'open'})
    }

    getRandomValue() {
        const rd = Math.random()
        if(rd > .5) {
            return '2'
        } else {
            return '4'
        }
    }

    getRandomPosition () {
        const bxsEmpty = isEmpty.filter(b => b[2] === true)
        const bxToFill = bxsEmpty[random(0, bxsEmpty.length - 1)]
        const iToFill = isEmpty.findIndex(b => b === bxToFill)
        isEmpty[iToFill][2] = false 
        const x = bxToFill[0]
        const y = bxToFill[1]

        return [x, y]
    }
    
    position = this.getRandomPosition()
    value = this.getRandomValue()


    getStyles() {
        const style = `
        div{
            background-color: #ee8;
            position: absolute;
            width: ${sizes.offsetWidth}px;
            height: ${sizes.offsetHeight}px;
            font-size: 4rem;
            transition: 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 1rem;
            user-select: none;
        }

        div[data-value="4"]{
            background-color: #fa8;
        }

        :host{
            display: block;
            animation: myAnim 0.5s ease-out;
        }

        @keyframes myAnim {
            0% {
                opacity: 0;
                transform: scale(7);
            }
        
            90%{
                transform: scale(0.85);
            }
            100% {
                opacity:    1;
                transform: scale(1);
            }
        }
        `

        return style
    }

    getTemplate() {
        const template = document.createElement('section')
        template.innerHTML = `
            <style>${this.getStyles()}</style>
            <div data-x="${this.position[0]}" data-y="${this.position[1]}" data-value="${this.value}">
                <p>${this.value}</p
            </div>
        `
        return template
    }

    connectedCallback() {
        const thisBox = this.getTemplate()
        this.shadowRoot.append(thisBox)
        activeBox.push(thisBox)
        currentGame[this.position[1]][this.position[0]] = thisBox
    }

    disconnectedCallback() {

    }
}


customElements.define('playable-box', PlayableBox)



function movePlayableBox(x, y, box){
    if ( !(x > 3 || y > 3) && !(x < 0 || y < 0) ) {
        box.dataset.x = x
        box.dataset.y = y
        box.style.transform = `translate(${MOVE_UNIT * x}px, ${MOVE_UNIT * y}px)`
    } else console.error("That box doesn't exist ")
}




function createNewPlayableBox () {
    const newPlayableBox = document.createElement('playable-box')
    gameContainer.insertBefore(newPlayableBox, game)
    const shorter = newPlayableBox.shadowRoot.children[0].children[1]
    movePlayableBox(shorter.dataset.x, shorter.dataset.y, shorter)
}


function startGame () {
    for ( let i = 0; i < 2; i++) {
        createNewPlayableBox()
    }
}

startGame()

function moveController (e) {
    if (e.key == 'ArrowUp') {
        moveBoxesToUp()
        console.log('up')
    } else if (e.key == 'ArrowDown') {
        moveBoxesToDown()
        console.log('down')
    } else if (e.key == 'ArrowLeft') {
        moveBoxesToLeft()
        console.log('left')
    } else if (e.key == 'ArrowRight') {
        console.log('right')
        moveBoxesToRight()
    } 
    if(e.key == 'ArrowRight'||e.key == 'ArrowLeft'||e.key == 'ArrowUp'||e.key == 'ArrowDown'){
        if(activeBox.length < 16){
            createNewPlayableBox()
        } else console.log('GAME OVER')
        checkWin()
    } 
}

function checkWin(a) {
    const values = activeBox.map(b => b.children[1].dataset.value)
    if( values.includes(v => v == '2048') || a){
        win()
        setTimeout(win, 4000)
    }
}

function win(){
    confetti.classList.toggle('active')
}

document.body.addEventListener('keyup', moveController)

function moveBoxesToRight () {
    for(let i = 0; i < 4; i++){
        activeBox.sort(orderRightToLeft).forEach(b => {
            const shorter = b.children[1].dataset
            if (shorter.x < 3) {
                const row = isEmpty.filter(b => b[1] == shorter.y)
                if(row[parseInt(shorter.x)+1][2] === true){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox((parseInt(shorter.x) + 1), parseInt(shorter.y), b.children[1])
                    changeIsEmpty(shorter.x, shorter.y, b)
                }
            }
        })
    }
    activeBox.sort(orderRightToLeft).forEach(b => {
        const shorter = b.children[1].dataset
        if(parseInt(shorter.x) < 3){
            const row = isEmpty.filter(b => b[1] == shorter.y)
            if(row[parseInt(shorter.x)+1][2] !== true){
                if ( currentGame[parseInt(shorter.y)][parseInt(shorter.x)+1].children[1].dataset.value === shorter.value ){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox((parseInt(shorter.x) + 1), parseInt(shorter.y), b.children[1])
                    joinBoxes(b, currentGame[parseInt(shorter.y)][parseInt(shorter.x)])
                }
            }
        }
    })
    activeBox.sort(orderRightToLeft).forEach(b => {
        const shorter = b.children[1].dataset
        if (shorter.x < 3) {
            const row = isEmpty.filter(b => b[1] == shorter.y)
            if(row[parseInt(shorter.x)+1][2] === true){
                changeIsEmpty(shorter.x, shorter.y, b)
                movePlayableBox((parseInt(shorter.x) + 1), parseInt(shorter.y), b.children[1])
                changeIsEmpty(shorter.x, shorter.y, b)
            }
        }
    })
}

function moveBoxesToLeft () {
    for(let i = 0; i < 4; i++){
        activeBox.sort(orderLeftToRight).forEach(b => {
            const shorter = b.children[1].dataset
            if (shorter.x > 0) {
                const row = isEmpty.filter(b => b[1] == shorter.y)
                if(row[parseInt(shorter.x)-1][2] === true){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox((parseInt(shorter.x) - 1), parseInt(shorter.y), b.children[1])
                    changeIsEmpty(shorter.x, shorter.y, b)
                }
            }
        })
    }
    activeBox.sort(orderLeftToRight).forEach(b => {
        const shorter = b.children[1].dataset
        const row = isEmpty.filter(b => b[1] == shorter.y)
        if(parseInt(shorter.x) > 0){
            if(row[parseInt(shorter.x)-1][2] !== true){
                if ( currentGame[parseInt(shorter.y)][parseInt(shorter.x)-1].children[1].dataset.value === shorter.value ){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox((parseInt(shorter.x) - 1), parseInt(shorter.y), b.children[1])
                    joinBoxes(b, currentGame[parseInt(shorter.y)][parseInt(shorter.x)])
                }
            }
        }
    })
    activeBox.sort(orderLeftToRight).forEach(b => {
        const shorter = b.children[1].dataset
        if (shorter.x > 0) {
            const row = isEmpty.filter(b => b[1] == shorter.y)
            if(row[parseInt(shorter.x)-1][2] === true){
                changeIsEmpty(shorter.x, shorter.y, b)
                movePlayableBox((parseInt(shorter.x) - 1), parseInt(shorter.y), b.children[1])
                changeIsEmpty(shorter.x, shorter.y, b)
            }
        }
    })
}

function moveBoxesToDown () {
    for(let i = 0; i < 4; i++){
        activeBox.sort(orderDownToUp).forEach(b => {
            const shorter = b.children[1].dataset
            if (shorter.y < 3) {
                const column = isEmpty.filter(b => b[0] == shorter.x)
                if(column[parseInt(shorter.y)+1][2] === true){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox(parseInt(shorter.x), (parseInt(shorter.y)+1), b.children[1])
                    changeIsEmpty(shorter.x, shorter.y, b)
                }
            }
        })
    }
    activeBox.sort(orderDownToUp).forEach(b => {
        const shorter = b.children[1].dataset
        if(parseInt(shorter.y) < 3){
            const column = isEmpty.filter(b => b[0] == shorter.x)
            if(column[parseInt(shorter.y)+1][2] !== true){
                if ( currentGame[parseInt(shorter.y)+1][parseInt(shorter.x)].children[1].dataset.value === shorter.value ){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox((parseInt(shorter.x)), parseInt(shorter.y) + 1, b.children[1])
                    joinBoxes(b, currentGame[parseInt(shorter.y)][parseInt(shorter.x)])
                }
            }
        }
    })
    activeBox.sort(orderDownToUp).forEach(b => {
        const shorter = b.children[1].dataset
        if (shorter.y < 3) {
            const column = isEmpty.filter(b => b[0] == shorter.x)
            if(column[parseInt(shorter.y)+1][2] === true){
                changeIsEmpty(shorter.x, shorter.y, b)
                movePlayableBox((parseInt(shorter.x)), parseInt(shorter.y) + 1, b.children[1])
                changeIsEmpty(shorter.x, shorter.y, b)
            }
        }
    })
}

function moveBoxesToUp () {
    for(let i = 0; i < 4; i++){
        activeBox.sort(orderUpToDown).forEach(b => {
            const shorter = b.children[1].dataset
            if (shorter.y > 0) {
                const column = isEmpty.filter(b => b[0] == shorter.x)
                if(column[parseInt(shorter.y)-1][2] === true){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox(parseInt(shorter.x), (parseInt(shorter.y)-1), b.children[1])
                    changeIsEmpty(shorter.x, shorter.y, b)
                }
            }
        })
    }
    activeBox.sort(orderUpToDown).forEach(b => {
        const shorter = b.children[1].dataset
        if(parseInt(shorter.y) > 0){
            const column = isEmpty.filter(b => b[0] == shorter.x)
            if(column[parseInt(shorter.y)-1][2] !== true){
                if ( currentGame[parseInt(shorter.y)-1][parseInt(shorter.x)].children[1].dataset.value === shorter.value ){
                    changeIsEmpty(shorter.x, shorter.y, b)
                    movePlayableBox((parseInt(shorter.x)), parseInt(shorter.y) - 1, b.children[1])
                    joinBoxes(b, currentGame[parseInt(shorter.y)][parseInt(shorter.x)])
                }
            }
        }
    })
    activeBox.sort(orderUpToDown).forEach(b => {
        const shorter = b.children[1].dataset
        if (shorter.y > 0) {
            const column = isEmpty.filter(b => b[0] == shorter.x)
            if(column[parseInt(shorter.y)-1][2] === true){
                changeIsEmpty(shorter.x, shorter.y, b)
                movePlayableBox((parseInt(shorter.x)), parseInt(shorter.y) - 1, b.children[1])
                changeIsEmpty(shorter.x, shorter.y, b)
            }
        }
    })
}

function orderRightToLeft(a, b){
    if (a.children[1].dataset.x > b.children[1].dataset.x) {
        return -1
    } else if (a.children[1].dataset.x < b.children[1].dataset.x) {
        return 1
    } else return 0
}

function orderLeftToRight(a, b){
    if (a.children[1].dataset.x < b.children[1].dataset.x) {
        return -1
    } else if (a.children[1].dataset.x > b.children[1].dataset.x) {
        return 1
    } else return 0
}

function orderUpToDown(a, b){
    if (a.children[1].dataset.y < b.children[1].dataset.y) {
        return -1
    } else if (a.children[1].dataset.y > b.children[1].dataset.y) {
        return 1
    } else return 0
}

function orderDownToUp(a, b){
    if (a.children[1].dataset.y > b.children[1].dataset.y) {
        return -1
    } else if (a.children[1].dataset.y < b.children[1].dataset.y) {
        return 1
    } else return 0
}

function joinBoxes (box1, box2){
    const shorter1 = box1.children[1].dataset
    box2.children[1].dataset.value = parseInt(shorter1.value)*2
    box2.children[1].children[0].textContent = box2.children[1].dataset.value
    const ri = activeBox.findIndex(b => b == box1)
    activeBox.splice(ri, 1)
    setTimeout((() => box1.remove()), 150)
}

function changeIsEmpty (x, y, box) {
    const i = isEmpty.findIndex(b => b[0] == x && b[1] == y)
    isEmpty[i][2] = !isEmpty[i][2]
    if(currentGame[y][x] !== false){
        currentGame[y][x] = false
    } else {
        currentGame[y][x] = box
    }
}