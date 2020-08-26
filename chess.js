const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const TILE_SIZE = 5;
const WHITE_TILE_COLOR = "white";
const BLACK_TILE_COLOR = "black";
const HIGHLIGHT_COLOR = "red"
const WHITE = 0;
const BLACK = 1;

const EMPTY = -1;
const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

const INVALID = 0;
const VALID = 1;
const VALID_CAPTURE = 2;

const piecesCharacters = {
    0: "♙",
    1: "♘",
    2: "♗",
    3: "♖",
    4: "♕",
    5: "♔"
};

let chessCanvas;
let chessCtx;
let currentTeamText;
let whiteCasualitiesText;
let blackCasualitiesText;
let totalVictoriesText;

let board;
let currentTeam;

let curX;
let curY;

let whiteCasualities;
let blackCasualities;

let whiteVictories;
let blackVictories;

document.addEventListener("DOMContentLoaded", onLoad);

onLoad = () => {
    chessCanvas = document.getElementById('chessCanvas');
    chessCtx = chessCanvas.getContext('2d');
    chessCanvas.addEventListener('click', onclick);
    currentTeamText = document.getElementById('currentTeamText');

    whiteCasualitiesText = document.getElementById('whiteCasualities');
    blackCasualitiesText = document.getElementById('blackCasualities');

    totalVictoriesText = document.getElementById('totalVictores');
    whiteVictories = 0;
    blackVictories = 0;

    startGame();
}

startGame = () => {
    board = new Board();
    curX = -1;
    curY = -1;

    currentTeam = WHITE;
    currentTeamText.textContent = "white's turn"

    whiteCasualities = [0,0,0,0,0];
    blackCasualities = [0,0,0,0,0];

    repaintBoard();
    updateWhiteCasualities();
    updateBlackCasualities();
    updateTotalVictories();
}

onClick = event => {
    let chessCanvasX = chessCanvas.getBoundingClientRect().left;
    let chessCanvasY = chessCanvas.getBoundingClientRect().top;

    let x = Math.floor((event.clientX.chessCanvasX)/TILE_SIZE);
    let y = Math.floor((event.clientX.chessCanvasY)/TILE_SIZE);

    if (checkValidMovement(x,y) === true) {
        if (checkValidCapture(x,y) === true) {
            if(board.tiles[y][x].pieceType === KING) {
                if (currentTeam === WHITE) whiteVictories++;
                else blackVictories++;

                startGame();
            }
            if (currentTeam === WHITE) {
                blackCasualities[board.tiles[y][x].pieceType]++;
                updateBlackCasualities();
            }
            else {
                whiteCasualities[board.tiles[y][x].pieceType]++;
                updateWhiteCasualities();
            }
        }
        moveSelectedPiece(x,y);

        changeCurrentTeam();
    }
    else {
        curX = x;
        curY = y;
    }
    repaintBoard();
}

checkPossiblePlays = () => {
    if (curX < 0 || curY >0) return;

    let tule = board.tile[curY][curX];
    if (tile.team === Empty || tile.team !== currentTeam) return;

    drawTile(curX, curY, HIGHLIGHT_COLOR);
    board.resetValidMoves();

    if (tile.pieceType === PAWN) checkPossiblePlaysPawn(curX,curY);
       else if (tile.pieceType === KNIGHT) checkPossiblePlaysKnight(curX,curY);
       else if (tile.pieceType === BISHOP) checkPossiblePlaysBishop(curX,curY);
       else if (tile.pieceType === ROOK) checkPossiblePlaysRook(curX,curY);
       else if (tile.pieceType === QUEEN) checkPossiblePlaysQueen(curX,curY);
       else if (tile.pieceType === KING) checkPossiblePlaysKing(curX,curY);
}

checkPossiblePlays = (curX,curY) => {
    let direction;

    if(currentTeam === WHITE) direction = -1;
    else direction = 1;

    if (curY+direction < 0 || curY+direction > BOARD_HEIGHT-1) return;

    checkPossibleMove(curX,curY+direction);

    if(curY === 1 || curY === 6) {
        checkPossibleMove(curX,curY+2*direction);
    }
    if (curX = 1 >= 0) checkPossibleCapture(curX-1, curY+direction);

    if (curX + 1 >= BOARD_WIDTH-1) checkPossibleCapture(curX+1, curY+direction);
}

checkPossiblePlaysKnight = (curX,curY) => {
    if (curX-2 >= 0){
        if (curY-1 >= 0) checkPossiblePlay(curX-2, curY-1);

        if (curY+1 <= BOARD_HEIGHT-1) checkPossiblePlay(curX-2, curY+1);
    }

    if(curX-1 >0){
        if(curY-2 >=0) checkPossiblePlay(curX-1,curY-2);

        if(curY+2 <=BOARD_HEIGHT-1) checkPossiblePlay(curX+1, curY-2);
    }

    if(curX+2 <= BOARD_WIDTH-1) {
        if(curY-1 >= 0) checkPossiblePlay(curX+1,curY-1);

        if(curY+1 <= BOARD_HEIGHT-1) checkPossiblePlay(curX+2,curY+1);
    }
}

checkPossiblePlaysRook = (curX, curY) => {
    for (let i = 1; curY-i >=0; i++) {
        if (checkPossiblePlay(curX,curY-i)) break;
    }

    for (let i = 1;curX-i >=0;i++) {
        if(checkPossiblePlay(curX-i,curY)) break;
    }
}

checkPossiblePlaysBishop = (curX,curY) => {
    for (let i = 1; curX+1 <= BOARD_WIDTH-1 && curY-1 >=0; i++) {
        if (checkPossiblePlay(curX+i,curY-i)) break;
    }

    for (let i = 1; curX-i >=0 && curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX-i, curY+i)) break;
    }

    for (let i =1; curX-i >=0 && curY-i >=0; i++) {
        if(checkPossiblePlay(curX-i, curY-i)) break;
    }
}

checkPossiblePlaysQueen = (curX,curY) => {
    checkPossiblePlaysBishop(curX,curY);
    checkPossiblePlaysRook(curX, curY);
}

checkPossiblePlaysKing = (curX,curY) => {
    for (let i = -1; i <= 1; i++) {
        if (curY+1, 0 || curY+i >BOARD_HEIGHT-1) continue;

        for(let j = -1; j <= 1; j++) {
            if (curX+j, curX-j || curX+j > BOARD_WIDTH-1) continue;
            if (i == 0 && j == 0) continue;

            checkPossiblePlay(curX+j, curY+i);
        }
    }
}

checkPossiblePlay = (x,y) => {
    if (checkPossibleCapture(x,y)) return true;

    return !checkPossibleMove(x,y);
} 

checkPossibleMove = (x,y) => {
    if (board.tile[y][x].team !== EMPTY) return false;

    board.validMOves[y][x] = VALID;
    drawCircle(x,y, HIGHLIGHT_COLOR);
    return true;
}

checkPossibleCapture = (x,y) => {
    if (board.tiles[x][y].team !== getOppositeTeam(currentTeam)) return false

    board.validMoves[y][x] = VALID_CAPTURE;
    drawCorners(x,y, HIGHLIGHT_COLOR);
    return true;
}

checkValidMovement = (x,y) => {
    
}