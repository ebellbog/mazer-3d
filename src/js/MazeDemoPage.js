import {randInt} from './utils.js';
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

class MazeDemoPage {
    constructor() {
        this.nRows = 25;
        this.nCols = 25;

        this.maze = null;

        this.currentMode = null;
        this.screenSaverInterval = null;

        this.pathStart = null;
        this.pathEnd = null;

        this.maze$ = $('#maze');
        this.mazeBg$ = $('#maze-background');

        const templates$ = $('#templates');
        this.cellTpl$ = templates$.find('.cell');
        this.cells$ = {};

        this.hookEvents();
    }

    hookEvents() {
        window.onresize = () => this.updateView();

        this.maze$
            .on('mouseover', '.cell', (e) => {
                e.stopPropagation();

                const cell$ = $(e.currentTarget);

                if (this.currentMode === InteractionMode.SCREEN_SAVER) {
                    return;
                }
                else if (this.currentMode === InteractionMode.SHORTEST_PATH) {
                    if (!this.pathStart || this.pathEnd) return;
                    this.updatePath(this.pathStart, cell$.attr('id'));
                } else if (this.currentMode === InteractionMode.DISTANCE_MAP) {
                    const distanceDict = this.maze.getDistanceDict(cell$.attr('id'));
                    const maxDist = Object.values(distanceDict).sort((a,b)=> parseInt(a) > parseInt(b)? -1 : 1)[0];

                    // Set hue by normalized distance (i.e. fraction of max dist).
                    this.maze.getCells().forEach((cell) => {
                        this.cells$[cell].find('.walls').css('background-color', `hsl(${300 * distanceDict[cell] / maxDist}, 100%, 40%)`);
                    });

                    this.mazeBg$.addClass('highlight-foreground');
                }
            })
            .on('click', '.cell', (e) => {
                e.stopPropagation();

                if (this.currentMode === InteractionMode.SHORTEST_PATH) {
                    const cell$ = $(e.currentTarget);
                    const cellId = cell$.attr('id');

                    if (this.pathStart && !this.pathEnd) {
                        this.pathEnd = cellId;
                    } else {
                        this.pathStart = cellId;
                        this.pathEnd = null;
                    }

                    this.updatePath(this.pathStart, this.pathEnd);
                }
            });

        $('body')
            .on('mouseover', () => {
                if (this.currentMode === InteractionMode.DISTANCE_MAP) {
                    Object.values(this.cells$).forEach((cell$) => cell$.find('.walls').css('background-color', ''));
                    this.mazeBg$.removeClass('highlight-foreground');
                }
            })
            .on('click', () => {
                if (this.currentMode === InteractionMode.SHORTEST_PATH) {
                    this.pathStart = null;
                    this.pathEnd = null;
                    this.updatePath(null, null);
                }
            });

        // TODO: add buttons to control mode-switching
        $(document).keydown((e) => {
            if (e.which === 32) {
                this.currentMode = this.currentMode === InteractionMode.DISTANCE_MAP ? InteractionMode.SHORTEST_PATH : InteractionMode.DISTANCE_MAP;
            }
        });
    }

    setupView() {
        this.maze$.empty();
        this.cells$ = {};

        const cells = this.maze.getCells()
        cells.forEach((cell, idx) => {
            const newCell$ = this.cellTpl$.clone();
            newCell$.attr('id', idx);

            this.cells$[cell] = newCell$;
            this.maze$.append(newCell$);
        });

        this.maze$.css({
            'grid-template-rows': `repeat(${this.nRows}, 1fr)`,
            'grid-template-columns': `repeat(${this.nCols}, 1fr)`
        });

        this.updateView();
    }

    updateView() {
        const mazeAspect = this.nRows / this.nCols;
        const screenAspect = window.innerHeight / window.innerWidth;

        this.mazeBg$.css({
            width: screenAspect > mazeAspect ? '80vw' : `${80/mazeAspect}vh` ,
            height: mazeAspect >= screenAspect ? '80vh' : `${80*mazeAspect}vw`
        });

        const defaultCell$ = this.maze$.find('.cell').first();

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

        this.mazeBg$.css({
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

    updatePath(start, end) {
        Object.values(this.cells$).forEach(cell$ => cell$.removeClass('path-start path-end path-middle'));
        if (!(start || end)) {
            this.mazeBg$.removeClass('highlight-foreground');
            return;
        }

        this.mazeBg$.addClass('highlight-foreground');

        if (!end) {
            const cells = this.maze.getCells();
            this.cells$[cells[start]].addClass('path-start');
            return;
        }

        const pathData = this.maze.getShortestPathData(start, end);
        pathData.forEach((cell, idx) => {
            const cell$ = this.cells$[cell];
            cell$.addClass(idx === 0 ? 'path-start' : idx === pathData.length - 1 ? 'path-end' : 'path-middle')
        });

        this.renderMaze(false);
    }

    renderMaze(withColor) {
        const cells = this.maze.getCells();

        cells.forEach((cell) => {
            const cell$ = this.cells$[cell];
            const wallDict = cell.getWalls();

            Object.keys(wallDict).forEach((key) => {
                if (wallDict[key].state === WallState.REMOVED){
                    cell$.addClass(`open-${key}`);
                }
            });

            if (withColor) {
                const cellColor = cell.visited ? cell.group.color : '';
                cell$.find('.walls').css('background-color', cellColor);
            }

            cell$.toggleClass('pending', !cell.visited);
        });
    }

    startMaze() {
        this.currentMode = InteractionMode.SHORTEST_PATH;

        this.maze = new Maze(this.nRows, this.nCols);
        this.setupView();

        this.maze.generateMaze();
        this.renderMaze(false);
    }

    startScreenSaver() {
        this.currentMode = InteractionMode.SCREEN_SAVER;

        this.nRows = randInt(MIN_SIZE, MAX_SIZE);
        this.nCols = randInt(MIN_SIZE, MAX_SIZE);

        this.maze = new Maze(this.nRows, this.nCols);

        let visitFunc = this.maze.getVisitFunction(false);
        let roundsToSkip = 1;

        this.screenSaverInterval = setInterval(()=>{
            if (roundsToSkip > 0) {
                roundsToSkip--;
                if (!roundsToSkip) this.setupView();
            }
            else {
                const shouldRepeat = visitFunc();
                this.renderMaze(true);

                if(!shouldRepeat){
                    this.nRows = randInt(MIN_SIZE, MAX_SIZE);
                    this.nCols = randInt(MIN_SIZE, MAX_SIZE);

                    this.maze = new Maze(this.nRows, this.nCols);
                    visitFunc = this.maze.getVisitFunction(false);
                    roundsToSkip = 30;
                }
            }
        }, SCREEN_SAVER_SPEED);
    }

    stopScreenSaver() {
        clearInterval(this.screenSaverInterval);
    }
}

export default MazeDemoPage;