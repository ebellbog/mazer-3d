import '../less/style.less';
import {initUtils, randInt} from './utils.js';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

const SCREEN_SAVER_SPEED = 40; // Delay in milliseconds between cell visits.
const MIN_SIZE = 6;
const MAX_SIZE = 30;

let nRows = 20;
let nCols = 20;

let screenSaverInterval;
let cells$, cellTpl$;
let maze$, mazeBg$;

$(document).ready(() => {
    initUtils();

    maze$ = $('#maze');
    mazeBg$ = $('#maze-background');

    const templates$ = $('#templates');
    cellTpl$ = templates$.find('.cell');

    startMaze();
});

function setupView(maze) {
    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    maze$.empty();
    cells$ = [];
    cells.forEach((cell, idx) => {
        const newCell$ = cellTpl$.clone();
        newCell$.attr('id', idx);

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

    const defaultCell$ = maze$.find('.cell').first();

    // If cell has open any walls, remove classes before calculating padding.
    const classes = defaultCell$.attr('class');
    const removeClasses = classes.split(' ').length > 1;
    if (removeClasses) {
        defaultCell$.attr('class', 'cell');
    }

    const defaultWall$ = defaultCell$.find('.walls');
    const mazePadding = (defaultCell$.width()-defaultWall$.width())/2;

    if (removeClasses) {
        defaultCell$.attr('class', classes);
    }

    mazeBg$.css({
        padding: mazePadding,
        'border-radius': mazePadding * 1.5
    });

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

        const cellColor = (withColor && cell.visited) ? (cell.color || cell.group.color) : '';
        cell$.find('.walls').css('background-color', cellColor);

        cell$.toggleClass('pending', !cell.visited);
    });
}

function startMaze() {
    const maze = new Maze(nRows, nCols);
    setupView(maze);
    window.onresize = () => updateView(maze);

    maze.generateMaze();
    renderMaze(maze, false);

    $('.cell').click((e) => {
        e.stopPropagation();

        const cell$ = $(e.currentTarget);
        maze.colorByDistanceFromCell(cell$.attr('id'));

        mazeBg$.addClass('highlight-foreground');
        renderMaze(maze, true);
    });

    $('body').click(() => {
        mazeBg$.removeClass('highlight-foreground');
        renderMaze(maze, false);
    });
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