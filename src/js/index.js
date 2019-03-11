import '../less/style.less';
import Maze from './Maze.js';

const mazeRows = 10;
const mazeCols = 10;

$(document).ready(() => {
    setupView();

    const maze = new Maze(mazeRows, mazeCols);
    const cells = maze.getCells();
    const lastCell = cells[cells.length-1];
    console.log(lastCell.getWalls());
});

function setupView() {
    const maze$ = $('#maze');
    const templates$ = $('#templates');

    maze$.css({
        'grid-template-rows': `repeat(${mazeRows}, 1fr)`,
        'grid-template-columns': `repeat(${mazeCols}, 1fr)`,
        width: mazeCols > mazeRows ? '80vw' : `${80 * mazeCols / mazeRows}vh` ,
        height: mazeRows >= mazeCols ? '80vh' : `${80 * mazeRows / mazeCols}vw` ,
    });

    const cell$ = templates$.find('.cell');

    for (let j = 0; j < mazeRows*mazeCols; j++) {
        maze$.append(cell$.clone());
    }

    const firstCell$ = maze$.find('.cell').first();
    const firstWall$ = firstCell$.find('.walls');

    const mazePadding = (firstCell$.width()-firstWall$.width())/2;
    maze$.css('padding', mazePadding);
}

function displayMaze() {
    // TODO: Apply wall classes to cell divs based on maze data.
}