import '../less/style.less';
import {initUtils, randInt} from './utils.js';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

const SCREEN_SAVER_SPEED = 40; // Delay in milliseconds between cell visits.
const MIN_SIZE = 6;
const MAX_SIZE = 30;

const InteractionMode = {
    SHORTEST_PATH: 'SHORTEST_PATH',
    DISTANCE_MAP: 'DISTANCE_MAP',
    SCREEN_SAVER: 'SCREEN_SAVER'
};

let nRows = 40;
let nCols = 40;

let currentMode;
let screenSaverInterval;
let cells$, cellTpl$;
let maze$, mazeBg$;
let maze;

$(document).ready(() => {
    initUtils();

    maze$ = $('#maze');
    mazeBg$ = $('#maze-background');

    hookEvents();

    const templates$ = $('#templates');
    cellTpl$ = templates$.find('.cell');

    startMaze();
});

function hookEvents() {
    window.onresize = () => updateView(maze);

    maze$.on('mouseover', '.cell', (e) => {
        e.stopPropagation();

        const cell$ = $(e.currentTarget);

        if (currentMode === InteractionMode.SCREEN_SAVER) {
            return;
        }
        else if (currentMode === InteractionMode.SHORTEST_PATH) {
            const cells = maze.getCells();
            cells.forEach(cell => cell.color = 'black');

            const pathData = maze.getShortestPathData(0, cell$.attr('id'));
            pathData.forEach((cell) => cell.color = 'tomato');

        } else if (currentMode === InteractionMode.DISTANCE_MAP) {
            const distanceDict = maze.getDistanceDict(cell$.attr('id'));
            const maxDist = Object.values(distanceDict).sort((a,b)=> parseInt(a) > parseInt(b)? -1 : 1)[0];

            // Set hue by normalized distance (i.e. fraction of max dist).
            maze.getCells().forEach((cell) => {
                cell.color = `hsl(${300 * distanceDict[cell] / maxDist}, 100%, 40%)`;
            });
        }

        mazeBg$.addClass('highlight-foreground');
        renderMaze(true);
    });

    $('body').on('mouseover', () => {
        if (currentMode === InteractionMode.SCREEN_SAVER) return;

        mazeBg$.removeClass('highlight-foreground');
        renderMaze(false);
    });

    $(document).keydown((e) => {
        if (e.which === 32) {
            currentMode = currentMode === InteractionMode.DISTANCE_MAP ? InteractionMode.SHORTEST_PATH : InteractionMode.DISTANCE_MAP;
        }
    });
}

function setupView() {
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

    updateView();
}

function updateView() {
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

function renderMaze(withColor) {
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
    currentMode = InteractionMode.DISTANCE_MAP;

    maze = new Maze(nRows, nCols);
    setupView();

    maze.generateMaze();
    renderMaze(false);
}

function startScreenSaver() {
    currentMode = InteractionMode.SCREEN_SAVER;

    nRows = randInt(MIN_SIZE, MAX_SIZE);
    nCols = randInt(MIN_SIZE, MAX_SIZE);

    maze = new Maze(nRows, nCols);

    let visitFunc = maze.getVisitFunction(false);
    let roundsToSkip = 1;

    screenSaverInterval = setInterval(()=>{
        if (roundsToSkip > 0) {
            roundsToSkip--;
            if (!roundsToSkip) setupView(maze);
        }
        else {
            const shouldRepeat = visitFunc();
            renderMaze(true);

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