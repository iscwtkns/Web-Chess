const squares = document.querySelectorAll(".square");
const promotionButtons = document.querySelectorAll(".promotionButton");
let selectedSquare = null;
let whiteTurn = true;
let whiteLeftCastle = true;
let whiteRightCastle = true;
let blackLeftCastle = true;
let blackRightCastle = true;
let enPassantColumn = null;
let board = [
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "wp", "", ""],
    ["", "", "wk", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "wq", "", "br", "", "bk", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "bp", "", "", ""],
    ["", "", "", "", "", "", "", ""]
];

board = initialiseBoard();
drawPieces();
closePromotionButtons();

promotionButtons.forEach(function(button, index) {
    button.addEventListener("click", (e) => {
        console.log(index);
        if (button.style.opacity !== "0") {
            let replacement = pawnNeedsPromotion().slice(0,1);
            if (index === 0) {
                replacement += "q";
            }
            if (index === 1) {
                replacement += "r"
            }
            if (index === 2) {
                replacement += "h";
            }
            if (index === 3) {
                replacement += "b";
            }
            if (pawnNeedsPromotion() === "white") {
                for (let i = 0; i < 8; i++) {
                    if (board[0][i] === "wp") {
                        board[0][i] = replacement;
                    }
                }
            }
            if (pawnNeedsPromotion() === "black") {
                for (let i = 0; i < 8; i++) {
                    if (board[7][i] === "bp") {
                        board[7][i] = replacement;
                    }
                }
            }

        }
        closePromotionButtons();
        drawPieces();
    })

});
squares.forEach(function(square, index) {
    square.addEventListener("click", (e) => {
        if (!pawnNeedsPromotion()) {
            const pos = convertToPos(square);
            const color = returnColor(board[pos[0]][pos[1]]);

            if (square === selectedSquare) {
                selectedSquare = null;
            } else if ((whiteTurn && color === "w") || (!whiteTurn && color === "b")) {
                selectedSquare = square;
            } else if (selectedSquare !== null && square.style.backgroundColor === "lightblue") {
                move(selectedSquare, square);
                drawPieces();
                whiteTurn = !whiteTurn;
                selectedSquare = null;
                if (pawnNeedsPromotion()) {
                    openPromotionButtons();
                }
            } else {
                selectedSquare = null;
            }

            highlightSquares();
        }

    })
})
function pawnNeedsPromotion() {
    for (let i = 0; i < 8; i++) {
        if (board[0][i] === "wp") {
            return "white";
        }
        if (board[7][i] === "bp") {
            return "black";
        }
    }
    return "";
}
function closePromotionButtons() {
    promotionButtons.forEach(function(button, index) {
        button.style.opacity = "0";
    })
}
function openPromotionButtons() {
    promotionButtons.forEach(function(button, index) {
        button.style.opacity = "1";
    })
    const color = pawnNeedsPromotion();
    console.log(color);
    if (color === "white") {
        document.getElementById("queen").src = "pieces/whiteQueen.png";
        document.getElementById("rook").src = "pieces/whiteRook.png";
        document.getElementById("horse").src = "pieces/whiteHorse.png";
        document.getElementById("bishop").src = "pieces/whiteBishop.png";
    }
    else {
        document.getElementById("queen").src = "pieces/blackQueen.png";
        document.getElementById("rook").src = "pieces/blackRook.png";
        document.getElementById("horse").src = "pieces/blackHorse.png";
        document.getElementById("bishop").src = "pieces/blackBishop.png";
    }
}
function move(squareFrom, squareTo) {
    enPassantColumn = null;
    let posFrom = convertToPos(squareFrom);
    let posTo = convertToPos(squareTo);

    //Handle Castling
    if (equal(posFrom, [7, 4]) && equal(posTo, [7, 2]) && whiteLeftCastle) {
        board[7][3] = board[7][0];
        board[7][0] = "";
    }
    if (equal(posFrom, [7, 4]) && equal(posTo, [7, 6]) && whiteRightCastle) {
        board[7][5] = board[7][7];
        board[7][7] = "";
    }
    if (equal(posFrom, [0, 4]) && equal(posTo, [0, 2]) && blackLeftCastle) {
        board[0][3] = board[0][0];
        board[0][0] = "";
    }
    if (equal(posFrom, [0, 4]) && equal(posTo, [0, 6]) && blackRightCastle) {
        board[0][5] = board[0][7];
        board[0][7] = "";
    }
    if (equal(posFrom, [0,0])) {
        blackLeftCastle = false;
    }
    if (equal(posFrom, [0,7])) {
        blackRightCastle = false;
    }
    if (equal(posFrom, [7,0])) {
        whiteLeftCastle = false;
    }
    if (equal(posFrom, [7,7])) {
        whiteRightCastle = false;
    }
    if (equal(posFrom, [0,4])) {
        blackRightCastle = false;
        blackLeftCastle = false;
    }
    if (equal(posFrom, [7,4])) {
        whiteLeftCastle = false;
        whiteRightCastle = false;
    }

    //Handle En Passant
    if (board[posFrom[0]][posFrom[1]] === "wp" || board[posFrom[0]][posFrom[1]] === "bp") {
        if (Math.abs(posFrom[0] - posTo[0]) === 2) {
            enPassantColumn = posFrom[1];
        }
        else if (posFrom[1] !== posTo[1] && board[posTo[0]][posTo[1]] === "") {
            board[posFrom[0]][posTo[1]] = "";
        }
    }

    board[posTo[0]][posTo[1]] = board[posFrom[0]][posFrom[1]];
    board[posFrom[0]][posFrom[1]] = "";
}
function highlightSquares() {
    squares.forEach(function(square, index) {
        if (selectedSquare === square) {
            square.style.backgroundColor = "blue";
        }
        else {
            square.style.backgroundColor = ""
        }
    })
    if (selectedSquare !== null) {
        returnMovableSquares(selectedSquare).forEach(function(square, index) {
            square.style.backgroundColor = "lightblue";
        })
    }
}
function returnMovableSquares(square) {
    let originalPos = convertToPos(square);
    let movableSquares = [];
    if (board[originalPos[0]][originalPos[1]] === "wr") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }//right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wh") {
        for (let i = -2; i < 3; i += 4) {
            for (let j = -1; j < 2; j += 2) {
                let pos1 = [originalPos[0] + i, originalPos[1] + j];
                let pos2 = [originalPos[0] + j, originalPos[1] + i];
                if (isValid(pos1)) {
                    let square = convertToSquare(pos1);
                    if (returnColor(board[pos1[0]][pos1[1]]) !== "w") {
                        movableSquares.push(square);
                    }
                }
                if (isValid(pos2)) {
                    let square = convertToSquare(pos2);
                    if (returnColor(board[pos2[0]][pos2[1]]) !== "w") {
                        movableSquares.push(square);
                    }
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wb") {

        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wq") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }
        //right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wk") {

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let pos = [originalPos[0] + i, originalPos[1] + j];
                if (isValid(pos) && pos !== originalPos) {
                    let square = convertToSquare(pos);
                    if (!(returnColor(board[pos[0]][pos[1]]) === "w")) {
                        movableSquares.push(square);
                    }
                }
            }
        }
        if (!whiteCheck(board)) {
            if (whiteLeftCastle) {
                let pos = [originalPos[0], originalPos[1] - 2];
                if (returnColor(board[pos[0]][pos[1]+1]) === "" && returnColor(board[pos[0]][pos[1]-1]) === "" && returnColor(board[pos[0]][pos[1]]) === "") {
                    movableSquares.push(convertToSquare(pos));
                }
            }
            if (whiteRightCastle) {
                let pos = [originalPos[0], originalPos[1] + 2];
                if (returnColor(board[pos[0]][pos[1]-1]) === "" && returnColor(board[pos[0]][pos[1]]) === "") {
                    movableSquares.push(convertToSquare(pos));
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wp") {
        const firstPos = [originalPos[0] - 1, originalPos[1]];
        if (!isOccupied(convertToSquare(firstPos))) {
            movableSquares.push(convertToSquare(firstPos));
            if (originalPos[0] === 6) {
                const secondPos = [originalPos[0] - 2, originalPos[1]];
                if (!isOccupied(convertToSquare(secondPos))) {
                    movableSquares.push(convertToSquare(secondPos));
                }
            }
        }
        const diagonalLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        if (isValid(diagonalLeftPos) && returnColor(board[diagonalLeftPos[0]][diagonalLeftPos[1]]) === "b") {
            movableSquares.push(convertToSquare(diagonalLeftPos));
        }
        const diagonalRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        if (isValid(diagonalRightPos) && returnColor(board[diagonalRightPos[0]][diagonalRightPos[1]]) === "b") {
            movableSquares.push(convertToSquare(diagonalRightPos));
        }
        if (originalPos[0] === 3) {
            if (enPassantColumn !== null) {
                if (Math.abs(originalPos[1]-enPassantColumn) === 1) {
                    movableSquares.push(convertToSquare([2, enPassantColumn]));
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "br") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }//right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "bh") {
        for (let i = -2; i < 3; i += 4) {
            for (let j = -1; j < 2; j += 2) {
                let pos1 = [originalPos[0] + i, originalPos[1] + j];
                let pos2 = [originalPos[0] + j, originalPos[1] + i];
                if (isValid(pos1)) {
                    let square = convertToSquare(pos1);
                    if (returnColor(board[pos1[0]][pos1[1]]) !== "b") {
                        movableSquares.push(square);
                    }
                }
                if (isValid(pos2)) {
                    let square = convertToSquare(pos2);
                    if (returnColor(board[pos2[0]][pos2[1]]) !== "b") {
                        movableSquares.push(square);
                    }
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "bb") {
        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }

    }
    if (board[originalPos[0]][originalPos[1]] === "bq") {

                //up direction
                let upPosition = [originalPos[0] - 1, originalPos[1]];
                while (isValid(upPosition)) {
                    if (returnColor(board[upPosition[0]][upPosition[1]]) === "w") {
                        movableSquares.push(convertToSquare(upPosition));
                        break;
                    }
                    if (isOccupied(convertToSquare(upPosition))) {
                        break;
                    }
                    movableSquares.push(convertToSquare(upPosition));
                    upPosition[0] -= 1;
                }
                //down direction
                let downPosition = [originalPos[0] + 1, originalPos[1]];
                while (isValid(downPosition)) {
                    if (returnColor(board[downPosition[0]][downPosition[1]]) === "w") {
                        movableSquares.push(convertToSquare(downPosition));
                        break;
                    }
                    if (isOccupied(convertToSquare(downPosition))) {
                        break;
                    }
                    movableSquares.push(convertToSquare(downPosition));
                    downPosition[0] += 1;
                }
                //left direction
                let leftPosition = [originalPos[0], originalPos[1] - 1];
                while (isValid(leftPosition)) {
                    if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "w") {
                        movableSquares.push(convertToSquare(leftPosition));
                        break;
                    }
                    if (isOccupied(convertToSquare(leftPosition))) {
                        break;
                    }
                    movableSquares.push(convertToSquare(leftPosition));
                    leftPosition[1] -= 1;
                }
                //right direction
                let rightPosition = [originalPos[0], originalPos[1] + 1];
                while (isValid(rightPosition)) {
                    if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "w") {
                        movableSquares.push(convertToSquare(rightPosition));
                        break;
                    }
                    if (isOccupied(convertToSquare(rightPosition))) {
                        break;
                    }
                    movableSquares.push(convertToSquare(rightPosition));
                    rightPosition[1] += 1;
                }
                //topleft direction
                let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
                while (isValid(topLeftPos)) {
                    const square = convertToSquare(topLeftPos);
                    if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "w") {
                        movableSquares.push(square);
                        break;
                    }
                    if (isOccupied(square)) {
                        break;
                    }
                    movableSquares.push(square);
                    topLeftPos[0] -= 1;
                    topLeftPos[1] -= 1;
                }
                //topright direction
                let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
                while (isValid(topRightPos)) {
                    const square = convertToSquare(topRightPos);
                    if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "w") {
                        movableSquares.push(square);
                        break;
                    }
                    if (isOccupied(square)) {
                        break;
                    }
                    movableSquares.push(square);
                    topRightPos[0] -= 1;
                    topRightPos[1] += 1;
                }
                //bottomleft direction
                let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
                while (isValid(bottomLeftPos)) {
                    const square = convertToSquare(bottomLeftPos);
                    if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "w") {
                        movableSquares.push(square);
                        break;
                    }
                    if (isOccupied(square)) {
                        break;
                    }
                    movableSquares.push(square);
                    bottomLeftPos[0] += 1;
                    bottomLeftPos[1] -= 1;
                }
                //bottomright direction
                let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
                while (isValid(bottomRightPos)) {
                    const square = convertToSquare(bottomRightPos);
                    if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "w") {
                        movableSquares.push(square);
                        break;
                    }
                    if (isOccupied(square)) {
                        break;
                    }
                    movableSquares.push(square);
                    bottomRightPos[0] += 1;
                    bottomRightPos[1] += 1;
                }
            }
    if (board[originalPos[0]][originalPos[1]] === "bk") {
        for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        let pos = [originalPos[0] + i, originalPos[1] + j];
                        if (isValid(pos) && pos !== originalPos) {
                            let square = convertToSquare(pos);
                            if (!(returnColor(board[pos[0]][pos[1]]) === "b")) {
                                movableSquares.push(square);
                            }
                        }
                    }
                }
        if (!blackCheck(board)) {
            if (blackLeftCastle) {
                let pos = [originalPos[0], originalPos[1] - 2];
                if (returnColor(board[pos[0]][pos[1]+1]) === "" && returnColor(board[pos[0]][pos[1]-1]) === "" && returnColor(board[pos[0]][pos[1]]) === "") {
                    movableSquares.push(convertToSquare(pos));
                }
            }
            if (blackRightCastle) {
                let pos = [originalPos[0], originalPos[1] + 2];
                if (returnColor(board[pos[0]][pos[1]-1]) === "" && returnColor(board[pos[0]][pos[1]]) === "") {
                    movableSquares.push(convertToSquare(pos));
                }
            }
        }

    }
    if (board[originalPos[0]][originalPos[1]] === "bp") {
        const firstPos = [originalPos[0] + 1, originalPos[1]];
        if (!isOccupied(convertToSquare(firstPos))) {
                    movableSquares.push(convertToSquare(firstPos));
                    if (originalPos[0] === 1) {
                        const secondPos = [originalPos[0] + 2, originalPos[1]];
                        if (!isOccupied(convertToSquare(secondPos))) {
                            movableSquares.push(convertToSquare(secondPos));
                        }
                    }
                }
        const diagonalLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        if (isValid(diagonalLeftPos) && returnColor(board[diagonalLeftPos[0]][diagonalLeftPos[1]]) === "w") {
                    movableSquares.push(convertToSquare(diagonalLeftPos));
                }
        const diagonalRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        if (isValid(diagonalRightPos) && returnColor(board[diagonalRightPos[0]][diagonalRightPos[1]]) === "w") {
                    movableSquares.push(convertToSquare(diagonalRightPos));
                }
        if (originalPos[0] === 4) {
            if (enPassantColumn !== null) {
                if (Math.abs(originalPos[1]-enPassantColumn) === 1) {
                    movableSquares.push(convertToSquare([5, enPassantColumn]));
                }
            }
        }
    }
    for (let i = movableSquares.length-1; i >= 0; i--) {
        const oldBoard = board.map(row => [...row]); // Deep copy of the board array
        const pos = convertToPos(movableSquares[i]);

        board[pos[0]][pos[1]] = board[originalPos[0]][originalPos[1]];
        board[originalPos[0]][originalPos[1]] = "";

        if ((whiteTurn && whiteCheck(board)) || (!whiteTurn && blackCheck(board))) {
            movableSquares.splice(i, 1);
        }
        board = oldBoard;
    }
    return movableSquares;
}
function convertToPos(square2) {
    let pos = [];
    squares.forEach(function (square, index) {
        if (square === square2) {
            pos.push(Math.floor(index / 8));
            if (pos[0] % 2 === 1) {
                pos.push(index % 8);
            }
            else {
                pos.push(7 - (index % 8));
            }
        }
    })
    return pos;
}
function isOccupied(square) {
    const pos = convertToPos(square);
    return board[pos[0]][pos[1]] !== "";
}
function convertToSquare(pos) {
    let index = pos[0] * 8;
    if (pos[0] % 2 === 0) {
        index += (7 - pos[1]);
    }
    else {
        index += pos[1];
    }
    let correctSquare = null;
    squares.forEach(function(square, i) {
        if (index === i) {
            correctSquare = square;
        }
    })
    return correctSquare;
}
function drawPieces() {
    squares.forEach(function(square, i) {
        if (square.firstChild !== null) {
            square.removeChild(square.firstChild);
        }
        if (Math.floor(i / 8) % 2 === 0) {
            i = Math.floor(i / 8) * 8 + (7-(i%8));
        }
        if (board[Math.floor(i / 8)][i % 8] === "") {
            return;
        }
        if (board[Math.floor(i / 8)][i % 8] === "br") {
            square.appendChild(createImage("pieces/blackRook.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "bh") {
            square.appendChild(createImage("pieces/blackHorse.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "bb") {
            square.appendChild(createImage("pieces/blackBishop.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "bq") {
            square.appendChild(createImage("pieces/blackQueen.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "bk") {
            square.appendChild(createImage("pieces/blackKing.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "bp") {
            square.appendChild(createImage("pieces/blackPawn.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "wr") {
            square.appendChild(createImage("pieces/whiteRook.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "wh") {
            square.appendChild(createImage("pieces/whiteHorse.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "wb") {
            square.appendChild(createImage("pieces/whiteBishop.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "wq") {
            square.appendChild(createImage("pieces/whiteQueen.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "wk") {
            square.appendChild(createImage("pieces/whiteKing.png"));
        }
        if (board[Math.floor(i / 8)][i % 8] === "wp") {
            square.appendChild(createImage("pieces/whitePawn.png"));
        }
    })
}
function createImage(path) {
    let image = document.createElement("img");
    image.src = path;
    image.className = "piece";
    return image;
}
function returnColor(boardString) {
    const string = boardString;
    if (boardString === "") {
        return boardString;
    }
    return string.slice(0,1);
}
function initialiseBoard() {
    return [
        ["br", "bh", "bb", "bq", "bk", "bb", "bh", "br"],
        ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
        ["wr", "wh", "wb", "wq", "wk", "wb", "wh", "wr"]
    ];
}
function isValid(pos) {
    return !(pos[0] < 0 || pos[0] > 7 || pos[1] < 0 || pos[1] > 7);
}
function whiteCheck(boardCheck) {
    let whiteKingPos = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardCheck[i][j] === "wk") {
                whiteKingPos = [i, j];
            }
        }
    }
    const wkSquare = convertToSquare(whiteKingPos);
    let inCheck = false;
    squares.forEach(function(square, index) {
        if (square.firstChild === null) {
            return;
        }
        if (returnColor(boardCheck[convertToPos(square)[0]][convertToPos(square)[1]]) === "b") {
            if (returnAllTargetedSquares(square, boardCheck).includes(wkSquare)) {
                inCheck = true;
            }
        }
    })
    return inCheck;
}
function blackCheck(boardCheck) {
    let blackKingPos = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardCheck[i][j] === "bk") {
                blackKingPos = [i, j];
            }
        }
    }
    const bkSquare = convertToSquare(blackKingPos);
    let inCheck = false;
    squares.forEach(function(square, index) {
        if (returnColor(boardCheck[convertToPos(square)[0]][convertToPos(square)[1]]) === "w") {
            if (returnAllTargetedSquares(square, boardCheck).includes(bkSquare)) {
                inCheck = true;
            }
        }

    })
    return inCheck;
}
function returnAllTargetedSquares(square) {
    let originalPos = convertToPos(square);
    let movableSquares = [];
    if (board[originalPos[0]][originalPos[1]] === "wr") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }//right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wh") {
        for (let i = -2; i < 3; i += 4) {
            for (let j = -1; j < 2; j += 2) {
                let pos1 = [originalPos[0] + i, originalPos[1] + j];
                let pos2 = [originalPos[0] + j, originalPos[1] + i];
                if (isValid(pos1)) {
                    let square = convertToSquare(pos1);
                    if (returnColor(board[pos1[0]][pos1[1]]) !== "w") {
                        movableSquares.push(square);
                    }
                }
                if (isValid(pos2)) {
                    let square = convertToSquare(pos2);
                    if (returnColor(board[pos2[0]][pos2[1]]) !== "w") {
                        movableSquares.push(square);
                    }
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wb") {

        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wq") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }
        //right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "b") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "b") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wk") {

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let pos = [originalPos[0] + i, originalPos[0] + j];
                if (isValid(pos) && pos !== originalPos) {
                    let square = convertToSquare(pos);
                    if (!(returnColor(board[pos[0]][pos[1]]) === "w")) {
                        movableSquares.push(square);
                    }
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "wp") {

        const diagonalLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        if (isValid(diagonalLeftPos) && returnColor(board[diagonalLeftPos[0]][diagonalLeftPos[1]]) === "b") {
            movableSquares.push(convertToSquare(diagonalLeftPos));
        }
        const diagonalRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        if (isValid(diagonalRightPos) && returnColor(board[diagonalRightPos[0]][diagonalRightPos[1]]) === "b") {
            movableSquares.push(convertToSquare(diagonalRightPos));
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "br") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }//right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "bh") {
        for (let i = -2; i < 3; i += 4) {
            for (let j = -1; j < 2; j += 2) {
                let pos1 = [originalPos[0] + i, originalPos[1] + j];
                let pos2 = [originalPos[0] + j, originalPos[1] + i];
                if (isValid(pos1)) {
                    let square = convertToSquare(pos1);
                    if (returnColor(board[pos1[0]][pos1[1]]) !== "b") {
                        movableSquares.push(square);
                    }
                }
                if (isValid(pos2)) {
                    let square = convertToSquare(pos2);
                    if (returnColor(board[pos2[0]][pos2[1]]) !== "b") {
                        movableSquares.push(square);
                    }
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "bb") {
        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }

    }
    if (board[originalPos[0]][originalPos[1]] === "bq") {

        //up direction
        let upPosition = [originalPos[0] - 1, originalPos[1]];
        while (isValid(upPosition)) {
            if (returnColor(board[upPosition[0]][upPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(upPosition));
                break;
            }
            if (isOccupied(convertToSquare(upPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(upPosition));
            upPosition[0] -= 1;
        }
        //down direction
        let downPosition = [originalPos[0] + 1, originalPos[1]];
        while (isValid(downPosition)) {
            if (returnColor(board[downPosition[0]][downPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(downPosition));
                break;
            }
            if (isOccupied(convertToSquare(downPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(downPosition));
            downPosition[0] += 1;
        }
        //left direction
        let leftPosition = [originalPos[0], originalPos[1] - 1];
        while (isValid(leftPosition)) {
            if (returnColor(board[leftPosition[0]][leftPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(leftPosition));
                break;
            }
            if (isOccupied(convertToSquare(leftPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(leftPosition));
            leftPosition[1] -= 1;
        }
        //right direction
        let rightPosition = [originalPos[0], originalPos[1] + 1];
        while (isValid(rightPosition)) {
            if (returnColor(board[rightPosition[0]][rightPosition[1]]) === "w") {
                movableSquares.push(convertToSquare(rightPosition));
                break;
            }
            if (isOccupied(convertToSquare(rightPosition))) {
                break;
            }
            movableSquares.push(convertToSquare(rightPosition));
            rightPosition[1] += 1;
        }
        //topleft direction
        let topLeftPos = [originalPos[0] - 1, originalPos[1] - 1];
        while (isValid(topLeftPos)) {
            const square = convertToSquare(topLeftPos);
            if (returnColor(board[topLeftPos[0]][topLeftPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topLeftPos[0] -= 1;
            topLeftPos[1] -= 1;
        }
        //topright direction
        let topRightPos = [originalPos[0] - 1, originalPos[1] + 1];
        while (isValid(topRightPos)) {
            const square = convertToSquare(topRightPos);
            if (returnColor(board[topRightPos[0]][topRightPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            topRightPos[0] -= 1;
            topRightPos[1] += 1;
        }
        //bottomleft direction
        let bottomLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        while (isValid(bottomLeftPos)) {
            const square = convertToSquare(bottomLeftPos);
            if (returnColor(board[bottomLeftPos[0]][bottomLeftPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomLeftPos[0] += 1;
            bottomLeftPos[1] -= 1;
        }
        //bottomright direction
        let bottomRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        while (isValid(bottomRightPos)) {
            const square = convertToSquare(bottomRightPos);
            if (returnColor(board[bottomRightPos[0]][bottomRightPos[1]]) === "w") {
                movableSquares.push(square);
                break;
            }
            if (isOccupied(square)) {
                break;
            }
            movableSquares.push(square);
            bottomRightPos[0] += 1;
            bottomRightPos[1] += 1;
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "bk") {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let pos = [originalPos[0] + i, originalPos[1] + j];
                if (isValid(pos) && pos !== originalPos) {
                    let square = convertToSquare(pos);
                    if (!(returnColor(board[pos[0]][pos[1]]) === "b")) {
                        movableSquares.push(square);
                    }
                }
            }
        }
    }
    if (board[originalPos[0]][originalPos[1]] === "bp") {

        const diagonalLeftPos = [originalPos[0] + 1, originalPos[1] - 1];
        if (isValid(diagonalLeftPos) && returnColor(board[diagonalLeftPos[0]][diagonalLeftPos[1]]) === "w") {
            movableSquares.push(convertToSquare(diagonalLeftPos));
        }
        const diagonalRightPos = [originalPos[0] + 1, originalPos[1] + 1];
        if (isValid(diagonalRightPos) && returnColor(board[diagonalRightPos[0]][diagonalRightPos[1]]) === "w") {
            movableSquares.push(convertToSquare(diagonalRightPos));
        }
    }
    /*
    for (let i = 0; i < movableSquares.length; i++) {
        let newBoard = board;
        let pos = convertToPos(movableSquares[i]);
        newBoard[pos[0]][pos[1]] = newBoard[originalPos[0]][originalPos[1]];
        newBoard[originalPos[0]][originalPos[1]] = "";
        if ((whiteTurn && whiteCheck(newBoard)) || (!whiteTurn && blackCheck(newBoard))) {
            movableSquares.splice(i, 1);
        }
    }
    */
    return movableSquares;
}
function equal(pos1, pos2) {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1]
}
function startGame() {
    board = initialiseBoard();
    drawPieces();
    closePromotionButtons();
    selectedSquare = null;
    highlightSquares();
    whiteLeftCastle = true;
    whiteRightCastle = true;
    blackLeftCastle = true
    blackRightCastle = true;
    enPassantColumn = null;
    whiteTurn = true;
}