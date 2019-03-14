import '../less/style.less';
import {initUtils, getRndInteger} from './utils.js';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

let nRows = 10;
let nCols = 10;

$(document).ready(() => {
    initUtils();
    startScreenSaver();
});

function setupView(maze) {
    const maze$ = $('#maze');

    const templates$ = $('#templates');
    const cell$ = templates$.find('.cell');

    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    maze$.empty();
    cells.forEach((cell, idx) => {
        const newCell$ = cell$.clone();
        newCell$.attr('data-cell-idx', idx);
        maze$.append(newCell$);
    });

    maze$.css({
        'grid-template-rows': `repeat(${mazeRows}, 1fr)`,
        'grid-template-columns': `repeat(${mazeCols}, 1fr)`
    });

    updateView(maze);
}

function updateView(maze) {
    const maze$ = $('#maze');
    const mazeBg$ = $('#maze-background');

    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    mazeBg$.css({
        width: mazeCols > mazeRows ? '80vw' : `${80 * mazeCols / mazeRows}vh` ,
        height: mazeRows >= mazeCols ? '80vh' : `${80 * mazeRows / mazeCols}vw`
    });

    const defaultCell$ = maze$.find('.cell:not(.open-left):not(.open-right)').first();
    const defaultWall$ = defaultCell$.find('.walls');
    const mazePadding = (defaultCell$.width()-defaultWall$.width())/2;

    mazeBg$.css('padding', mazePadding);

    $('.vertex').css({
        top: -mazePadding,
        right: -mazePadding,
        height: mazePadding*2,
        width: mazePadding*2,
        'border-radius': mazePadding
    });
}
function renderMaze(maze) {
    const cells = maze.getCells();

    cells.forEach((cell, idx) => {
        const cell$ = $(`.cell[data-cell-idx=${idx}]`);
        const wallDict = cell.getWalls();

        Object.keys(wallDict).forEach((key) => {
            if (wallDict[key].state === WallState.REMOVED){
                cell$.addClass(`open-${key}`);
            }
        })

        cell$.find('.label').html(cell.group.accessibleUnvisitedCells.size);
        if (cell.visited) {
            cell$.find('.walls').css('background-color', cell.group.color);
        }
        cell$.toggleClass('pending', !cell.visited);
    });
}

function startMaze() {
    const maze = new Maze(nRows, nCols);
    setupView(maze);
    window.onresize = () => updateView(maze);

    maze.generateMaze();
    renderMaze(maze);
}

function startScreenSaver() {
    let maze = new Maze(nRows, nCols);
    let visitFunc = maze.getVisitFunction(false);
    let roundsToSkip=1;

    setInterval(()=>{
        if(roundsToSkip > 0){
            roundsToSkip-=1;
            if (!roundsToSkip) setupView(maze);
        }
        else{
            const shouldRepeat = visitFunc();
            renderMaze(maze);

            if(!shouldRepeat){
                nRows = getRndInteger(3, 20);
                nCols = getRndInteger(3, 20);

                maze = new Maze(nRows, nCols);
                visitFunc = maze.getVisitFunction(false);
                roundsToSkip=30;
            }
        }
    }, 50);
}