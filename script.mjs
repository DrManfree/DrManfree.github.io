class Maze {
    
    constructor(width, height) {

        if (width < 2 || height < 2)
            throw new Error('Invalid maze sizes.');

        this.width = Math.floor(width);
        this.height = Math.floor(height);
        this.data = [];
        this.counter = 1;
    }

    generateMaze() {

        // Create the first row and fill it with empty values
        this.data.push([]);
        for (let i = 0; i < this.width; i++) {
            this.data[0][i] = {value: 0, bottomWall: false, rightWall: false};
        }

        for (let i = 0; i < this.height - 1; i++) {

            // Assign unique values to every empty cell (cell is empty if its value is 0)
            this.assignValues(i); 

            // Create vertical walls for the current row
            this.addVerticalWalls(i);

            // Create horizontal walls for the current row
            this.addHorizontalWalls(i);

            // Create next row
            this.createNewRow(i);
        }

        this.assignValues(this.height - 1);
        this.addVerticalWalls(this.height - 1);
        for (let i = 0; i < this.width - 1; i++) {
            if (this.data[this.height - 1][i].value != this.data[this.height - 1][i + 1].value) {
                
                this.mergeValues(this.data[this.height - 1][i + 1].value, 
                                 this.data[this.height - 1][i].value, this.height - 1);
                this.data[this.height - 1][i].rightWall = false;
            }
        };
    }

    assignValues(rowIndex) {

        for (let i = 0; i < this.data[rowIndex].length; i++) {

            if (this.data[rowIndex][i].value == 0) {
                this.data[rowIndex][i].value = this.counter;
                this.counter++;
            }
        }
    }

    addVerticalWalls(rowIndex) {

        for (let i = 0; i < this.data[rowIndex].length - 1; i++) {

            let curObj = this.data[rowIndex][i];
            let createWall = Math.round(Math.random());

            // Create a vertical wall if the current and next cells' values are the same to prevent loops
            if (createWall || curObj.value == this.data[rowIndex][i+1].value)
                curObj.rightWall = true;
            
            // If we do not create a wall, merge the current and the next cells' values to one
            else
                this.mergeValues(this.data[rowIndex][i+1].value, curObj.value, rowIndex);
        }
    }

    mergeValues(toMerge, target, rowIndex) {

        this.data[rowIndex].forEach(item => {
            if (item.value == toMerge)
                item.value = target;
        });
    }

    addHorizontalWalls(rowIndex) {

        for (let i = 0; i < this.data[rowIndex].length; i++) {

            let curObj = this.data[rowIndex][i];
            let createWall = Math.round(Math.random());

            // If a cell is unique in its value or if every other cell of same value has a wall, do not create a wall
            if (createWall && this.isEligible(rowIndex, i))
                curObj.bottomWall = true;
        }
    }

    isEligible(rowIndex, cellIndex) {

        let valueCount = 0;
        let wallCount = 0;

        this.data[rowIndex].forEach(item => {

            if (item.value == this.data[rowIndex][cellIndex].value) {
                valueCount++;
                if (item.bottomWall == true)
                    wallCount++;
            }
        });

        if (valueCount == 1)
            return false;
        
        if (valueCount - wallCount == 1)
            return false;

        return true;
    }

    createNewRow(rowIndex) {

        
        let newArray = JSON.parse(JSON.stringify(this.data[rowIndex]));
        this.data.push(newArray);

        this.data[rowIndex + 1].forEach(item => {

            if (item.rightWall)
                item.rightWall = false;

            if (item.bottomWall) {
                item.bottomWall = false;
                item.value = 0;
            }
        })
    }
}

let maze;
let modeEnter = false;
let modeExit = false;
let enter = null, exit = null;
function createMaze() {

    document.querySelector('.maze-content').innerHTML = '';
    
    if (enter)
        enter = null;
    if (exit)
        exit = null;
    document.querySelector('.button-path').disabled = true;

    let width = document.querySelector('#maze-width').value;
    let height = document.querySelector('#maze-height').value;

    maze = new Maze(width, height);
    maze.generateMaze();

    for (let i = 0; i < height; i++) {

        let mazeRow = document.createElement('div');
        document.querySelector('.maze-content').appendChild(mazeRow);
        mazeRow.className = 'maze-row';
        mazeRow.id = `row${i}`;

        for (let j = 0; j < width; j++) {
            let mazeCell = document.createElement('div');
            mazeRow.appendChild(mazeCell);
            mazeCell.className = 'maze-cell';
            mazeCell.id = `cell${j}`;
            if (maze.data[i][j].bottomWall)
                mazeCell.style.setProperty('border-bottom', 
                '2px solid black');
            if (maze.data[i][j].rightWall)
                mazeCell.style.setProperty('border-right', 
                '2px solid black');
        }
    }

    document.querySelector('.button-entry').disabled = false;
    document.querySelector('.button-exit').disabled = false;
    document.querySelector('.maze-content').onclick = function(event) {
        let target = event.target;
        if (target.className != 'maze-cell') return;
        placeNode(target);
    };
}

function enterMode() {
    if (!modeEnter) {
        if (modeExit)
            exitMode();
        document.querySelector('.maze-content')
        .style.setProperty('outline-color', 'green');
    }
    else {
        document.querySelector('.maze-content')
        .style.setProperty('outline-color', 'black');
    }
    modeEnter = !modeEnter;
}

function exitMode() {
    if (!modeExit) {
        if (modeEnter)
            enterMode();
        document.querySelector('.maze-content')
        .style.setProperty('outline-color', 'red');
    }
    else {
        document.querySelector('.maze-content')
        .style.setProperty('outline-color', 'black');
    }
    modeExit = !modeExit;
}

function placeNode(target) {
    
    if (modeEnter) {
        if (exit == target)
            return;
        if (enter) {
            enter.style.setProperty('background','white');
            clearWaves();
        }
        target.style.setProperty('background', 'rgba(152, 248, 168, 0.5)');
        enter = target;
        enterMode();
    }

    if (modeExit) {
        if (enter == target)
            return;
        if (exit) {
            exit.style.setProperty('background','white');
            clearWaves();
        }
        target.style.setProperty('background', 'rgba(253, 83, 83, 0.5)');
        exit = target;
        exitMode();
    }

    if (enter != null && exit != null)
        document.querySelector('.button-path').disabled = false;
}

function findPath() {

    clearWaves();
    let startY = +enter.id.replace('cell','');
    let startX = +enter.parentNode.id.replace('row','');
    let endY = +exit.id.replace('cell','');
    let endX = +exit.parentNode.id.replace('row','');

    let toVisit = [];
    toVisit.push([startX, startY]);
    maze.data[startX][startY].wave = 0;
    while (toVisit.length) {

        let x = toVisit[0][0];
        let y = toVisit[0][1];
        let current = maze.data[x][y];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {

                if (x + i >= 0 && x + i < maze.height &&
                    y + j >= 0 && y + j < maze.width &&
                    Math.abs(i + j) == 1 &&
                    !checkWall(x, y, x+i, y+j) &&
                    maze.data[x+i][y+j].wave == undefined) {

                    maze.data[x + i][y + j].wave = current.wave + 1;

                    if (x + i == endX && y + j == endY)
                        return displayPath();

                    toVisit.push([x + i, y + j]);
                }
            }
        }

        toVisit.shift();
    }
}

function checkWall (x1, y1, x2, y2) {

    if (x1 == x2) {

        if (y1 > y2)
            return (maze.data[x2][y2].rightWall);

        if (y1 < y2)
            return (maze.data[x1][y1].rightWall);
    }

    if (y1 == y2) {

        if (x1 > x2)
            return (maze.data[x2][y2].bottomWall);

        if (x1 < x2)
            return (maze.data[x1][y1].bottomWall);
    }
}

function clearWaves() {
    maze.data.forEach(item => {
        item.forEach(cell => {
            cell.wave = undefined;
        });
    });

    document.querySelectorAll('.maze-cell').forEach(item => {

        if (item.style.background == 'yellow')
            item.style.background = '';
    });
}

function displayPath() {

    let startY = +enter.id.replace('cell','');
    let startX = +enter.parentNode.id.replace('row','');
    let endY = +exit.id.replace('cell','');
    let endX = +exit.parentNode.id.replace('row','');

    let x = endX, y = endY;
    let found = false;

    while (!found) {

        let i = -1, j = -1;
        while (i <= 1) {
            while (j <= 1) {

                if (x + i >= 0 && x + i < maze.height &&
                    y + j >= 0 && y + j < maze.width &&
                    Math.abs(i + j) == 1 &&
                    !checkWall(x, y, x+i, y+j)) {

                    if (maze.data[x+i][y+j].wave + 1 == maze.data[x][y].wave) {

                        if (x+i == startX && y+j == startY) {
                            found = true;
                        }

                        else {
                            document.querySelector(`#row${x+i} #cell${y+j}`)
                            .style.background = 'yellow';
                        }

                        x = x + i;
                        y = y + j;

                        j = 5;
                        i = 5;
                    }
                }
                j++;
            }
            i++;
            if (j < 3)
                j = -1;
        }
    }
}
