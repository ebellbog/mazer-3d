import '../less/style.less';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

const nRows = 15;
const nCols = 15;

$(document).ready(() => {
    const maze = new Maze(nRows, nCols);
    setupView(maze);
    window.onresize = () => updateView(maze);

    maze.generateMaze();
    renderMaze(maze);
});

function setupView(maze) {
    const maze$ = $('#maze');

    const templates$ = $('#templates');
    const cell$ = templates$.find('.cell');

    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

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

    $('.corner').css({
        height: mazePadding*2,
        width: mazePadding*2,
        'border-radius': mazePadding
    });
    $('.corner.top-left').css({
        top: -mazePadding,
        left: -mazePadding
    });
    $('.corner.top-right').css({
        top: -mazePadding,
        right: -mazePadding
    });
    $('.corner.bottom-left').css({
        bottom: -mazePadding,
        left: -mazePadding
    });
    $('.corner.bottom-right').css({
        bottom: -mazePadding,
        right: -mazePadding
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
    });
}
