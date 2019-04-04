import {randInt} from './utils.js';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

const DISTANCE_MAP_ANIMATION_SPEED = 40; // Delay (in milliseconds) between distance steps.

const ANIMATION_SPEED = 40; // Delay (in milliseconds) between cell visits.
const MIN_SIZE = 6;
const MAX_SIZE = 30;

const InteractionMode = {
    SHORTEST_PATH: 'SHORTEST_PATH',
    DISTANCE_MAP: 'DISTANCE_MAP',
};

// Helper methods

function getColorForNormalizedDistance(distance) {
   return `hsl(${300 * distance}, 100%, 40%)`;
}

class MazeDemoPage {
    constructor() {
        this.nRows = 25;
        this.nCols = 25;

        this.maze = null;

        this.currentMode = InteractionMode.DISTANCE_MAP;
        this.isAnimating = false;
        this.screenSaverInterval = null;

        this.pathStart = null;
        this.pathEnd = null;
        this.pathLength = 0;
        this.maxLength = 0;

        this.pathLength$ = $('#path-length');
        this.maxLength$ = $('#max-length');

        this.maze$ = $('#maze');
        this.mazeBg$ = $('#maze-background');

        const templates$ = $('#templates');
        this.cellTpl$ = templates$.find('.cell');
        this.cells$ = {};

        this.tooltip$ = $('#tooltip');
        this.toolbar$ = $('#toolbar');

        this.hookEvents();
    }

    hookEvents() {
        window.onresize = () => this.updateView();

        this.maze$
            .on('mouseover', '.cell', (e) => {
                e.stopPropagation();

                const cell$ = $(e.currentTarget);

                if (this.isAnimating) return;
                else if (this.currentMode === InteractionMode.SHORTEST_PATH) {
                    if (!this.pathStart || this.pathEnd) return;
                    this.updatePath(this.pathStart, cell$.attr('id'));
                    this.tooltip$.show();
                } else if (this.currentMode === InteractionMode.DISTANCE_MAP) {
                    this.drawDistanceMap(cell$);
                }
            })
            .on('click', '.cell', (e) => {
                e.stopPropagation();
                const cell$ = $(e.currentTarget);

                if (this.isAnimating) return;
                else if (this.currentMode === InteractionMode.SHORTEST_PATH) {
                    const cellId = cell$.attr('id');

                    if (this.pathStart && !this.pathEnd) {
                        this.pathEnd = cellId;
                        this.tooltip$.hide();
                    } else {
                        this.pathStart = cellId;
                        this.pathEnd = null;

                        this.pathLength = 0;
                        this.maxLength = 0;
                    }

                    this.updatePath(this.pathStart, this.pathEnd);
                } else if (this.currentMode === InteractionMode.DISTANCE_MAP) {
                    this.animateDistanceMap(cell$);
                }
            });

        this.toolbar$
            .on('click', '#distance-map:not(.active)', () => {
                this.currentMode = InteractionMode.DISTANCE_MAP;
                this.clearPath();
                $('#shortest-path').removeClass('active');
                $('#distance-map').addClass('active');
            })
            .on('click', '#shortest-path:not(.active)', () => {
                this.currentMode = InteractionMode.SHORTEST_PATH;
                $('#distance-map').removeClass('active');
                $('#shortest-path').addClass('active');
            });

        $('#start-animating').click(() => this.startAnimating());
        $('#stop-animating').click(()=>this.stopAnimating());


        $('body')
            .on('mouseover', () => {
                if (this.isAnimating) return;
                else if (this.currentMode === InteractionMode.DISTANCE_MAP) {
                    Object.values(this.cells$).forEach((cell$) => cell$.find('.walls').css('background-color', ''));
                    this.mazeBg$.removeClass('highlight-foreground');
                }
                this.tooltip$.hide();
            })
            .on('click', () => {
                if (this.isAnimating) return;
                else if (this.currentMode === InteractionMode.SHORTEST_PATH) {
                    this.clearPath();
                }
            });

        $(document)
            .on('mousemove', (e) => {
                this.updateTooltip(e);
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
        this.pathLength = pathData.length-1;
        this.maxLength = Math.max(this.maxLength, this.pathLength);

        pathData.forEach((cell, idx) => {
            const cell$ = this.cells$[cell];
            cell$.addClass(idx === 0 ? 'path-start' : idx === pathData.length - 1 ? 'path-end' : 'path-middle')
        });

        this.renderMaze(false);
    }

    clearPath() {
        this.pathStart = null;
        this.pathEnd = null;
        this.updatePath(null, null);
        this.tooltip$.hide();
    }

    updateTooltip(e) {
        this.tooltip$.css({ top: e.clientY - this.tooltip$.innerHeight() - 20, left: e.clientX - this.tooltip$.innerWidth() / 2 });
        this.pathLength$.html(this.pathLength);
        this.maxLength$.html(this.maxLength);
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

            const cellColor = withColor && cell.visited ? cell.group.color : '';
            cell$.find('.walls').css('background-color', cellColor);

            cell$.toggleClass('pending', !cell.visited);
        });
    }

    startMaze() {

        this.maze = new Maze(this.nRows, this.nCols);
        this.setupView();

        this.maze.generateMaze();
        this.renderMaze(false);
    }

    startAnimating() {
        this.isAnimating = true;

        this.toolbar$.addClass('animating');
        this.toolbar$.find('#interaction-mode .tool-option').attr('disabled', true);

        this.mazeBg$.addClass('highlight-foreground');

        this.nRows = randInt(MIN_SIZE, MAX_SIZE);
        this.nCols = randInt(MIN_SIZE, MAX_SIZE);

        this.maze = new Maze(this.nRows, this.nCols);

        let roundsToSkip = 1;

        this.screenSaverInterval = setInterval(()=>{
            if (roundsToSkip > 0) {
                roundsToSkip--;
                if (!roundsToSkip) this.setupView();
            }
            else {
                const shouldRepeat = this.maze.generateNextCell();
                this.renderMaze(true);

                if (!shouldRepeat) {
                    this.nRows = randInt(MIN_SIZE, MAX_SIZE);
                    this.nCols = randInt(MIN_SIZE, MAX_SIZE);

                    this.maze = new Maze(this.nRows, this.nCols);
                    roundsToSkip = 30;
                }
            }
        }, ANIMATION_SPEED);
    }

    stopAnimating() {
        this.isAnimating = false;

        this.toolbar$.removeClass('animating');
        this.toolbar$.find('#interaction-mode .tool-option').attr('disabled', false);

        this.mazeBg$.removeClass('highlight-foreground');

        clearInterval(this.screenSaverInterval);
        while (this.maze.generateNextCell()) {}

        this.renderMaze();
    }

    drawDistanceMap(startCell$) {
        const distanceDict = this.maze.getDistanceDict(startCell$.attr('id'));
        const maxDist = Object.values(distanceDict).sort((a, b) => parseInt(a) > parseInt(b) ? -1 : 1)[0];

        // Set hue by normalized distance (i.e. fraction of max dist).
        this.maze.getCells().forEach((cell) => {
            this.cells$[cell].find('.walls').css('background-color', getColorForNormalizedDistance(distanceDict[cell] / maxDist));
        });

        this.mazeBg$.addClass('highlight-foreground');
    }

    animateDistanceMap(startCell$) {
        this.isAnimating = true;
        this.renderMaze(false);

        this.toolbar$.addClass('animating-distance-map');
        this.toolbar$.find('.tool-option').attr('disabled', true);

        const distanceDict = this.maze.getDistanceDict(startCell$.attr('id'));
        const reversedDict = {};
        Object.keys(distanceDict).forEach((cell) => {
            const distance = distanceDict[cell];
            if (!(distance in reversedDict)) {
                reversedDict[distance] = [];
            }
            reversedDict[distance].push(cell)
        });
        const maxDist = Object.keys(reversedDict).length;
        let currentDist = 0;
        const distanceInterval = setInterval(()=>{
            if (currentDist < maxDist) {
                const cells = reversedDict[currentDist];
                cells.forEach((cell)=>{
                    this.cells$[cell].find('.walls').css('background-color', getColorForNormalizedDistance(currentDist / maxDist));
                });
                currentDist++;
            }
            else {
                clearInterval(distanceInterval);

                this.isAnimating = false;
                this.toolbar$.removeClass('animating-distance-map');
                this.toolbar$.find('.tool-option').attr('disabled', false);
            }
        }, DISTANCE_MAP_ANIMATION_SPEED);
    }
}

export default MazeDemoPage;