import '../less/style.less';
import {initUtils, randInt} from './utils.js';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

const SCREEN_SAVER_SPEED = 40; // Delay in milliseconds between cell visits.
const MIN_SIZE = 6;
const MAX_SIZE = 30;

let nRows = 15;
let nCols = 15;

let screenSaverInterval;
let cells$, cellTpl$;
let maze$, mazeBg$;

$(document).ready(() => {
    initUtils();

    maze$ = $('#maze');
    mazeBg$ = $('#maze-background');

    const templates$ = $('#templates');
    cellTpl$ = templates$.find('.cell');

    startScreenSaver();
});

function setupView(maze) {
    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    maze$.empty();
    cells$ = [];
    cells.forEach((cell, idx) => {
        const newCell$ = cellTpl$.clone();
        cells$.push(newCell$);
        maze$.append(newCell$);
    });

    maze$.css({
        'grid-template-rows': `repeat(${mazeRows}, 1fr)`,
        'grid-template-columns': `repeat(${mazeCols}, 1fr)`
    });

    updateView(maze);
}

function updateView(maze) {
    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    const mazeAspect = mazeRows / mazeCols;
    const screenAspect = window.innerHeight / window.innerWidth;

    mazeBg$.css({
        width: screenAspect > mazeAspect ? '80vw' : `${80 * mazeCols / mazeRows}vh` ,
        height: mazeAspect >= screenAspect ? '80vh' : `${80 * mazeRows / mazeCols}vw`
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

function renderMaze(maze, withColor) {
    const cells = maze.getCells();

    cells.forEach((cell, idx) => {
        const cell$ = cells$[idx];
        const wallDict = cell.getWalls();

        Object.keys(wallDict).forEach((key) => {
            if (wallDict[key].state === WallState.REMOVED){
                cell$.addClass(`open-${key}`);
            }
        });

        cell$.find('.label').html(cell.group.accessibleUnvisitedCells.size);
        if (withColor && cell.visited) {
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
    renderMaze(maze, false);
}

function startScreenSaver() {
    let maze = new Maze(nRows, nCols);
    window.onresize = () => updateView(maze);

    let visitFunc = maze.getVisitFunction(false);
    let roundsToSkip = 1;

    screenSaverInterval = setInterval(()=>{
        if (roundsToSkip > 0) {
            roundsToSkip--;
            if (!roundsToSkip) setupView(maze);
        }
        else {
            const shouldRepeat = visitFunc();
            renderMaze(maze, true);

            if(!shouldRepeat){
                nRows = randInt(MIN_SIZE, MAX_SIZE);
                nCols = randInt(MIN_SIZE, MAX_SIZE);

                maze = new Maze(nRows, nCols);
                visitFunc = maze.getVisitFunction(false);
                roundsToSkip = 30;
            }
        }
    }, SCREEN_SAVER_SPEED);
}

function stopScreenSaver() {
    clearInterval(screenSaverInterval);
}