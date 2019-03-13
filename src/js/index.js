import '../less/style.less';
import Maze from './Maze.js';
import Wall from './Wall.js'
import {WallState} from './Wall.js'

const nRows = 10;
const nCols = 10;

$(document).ready(() => {
    const maze = new Maze(nRows, nCols);
    maze.generateMaze();
    //TESTING
    // const walls = maze.data.reduce((cells, row) => {
    //     return cells.concat(row.filter((entity) => entity instanceof Wall));
    // }, []);
    // const remove = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    // remove.forEach(number => walls[number].state = WallState.REMOVED);

    //END TESTING
    displayMaze(maze);
});

function displayMaze(maze) {
    const maze$ = $('#maze');
    const templates$ = $('#templates');
    const cell$ = templates$.find('.cell');

    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    cells.forEach((cell) => {
        const newCell$ = cell$.clone();

        const wallDict = cell.getWalls();
        Object.keys(wallDict).forEach((key) => {
            if (wallDict[key].state === WallState.REMOVED){
                newCell$.find('.walls').addClass(`open-${key}`);
            }
        })

        maze$.append(newCell$);
    });

    maze$.css({
        'grid-template-rows': `repeat(${mazeRows}, 1fr)`,
        'grid-template-columns': `repeat(${mazeCols}, 1fr)`,
        width: mazeCols > mazeRows ? '80vw' : `${80 * mazeCols / mazeRows}vh` ,
        height: mazeRows >= mazeCols ? '80vh' : `${80 * mazeRows / mazeCols}vw` ,
    });


    const firstCell$ = maze$.find('.cell').first();
    const firstWall$ = firstCell$.find('.walls');

    const mazePadding = (firstCell$.width()-firstWall$.width())/2;
    maze$.css('padding', mazePadding);
}
