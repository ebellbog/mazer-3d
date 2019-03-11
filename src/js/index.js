import '../less/style.less';
import Maze from './Maze.js';

const nRows = 4;
const nCols = 6;

$(document).ready(() => {


    const maze = new Maze(nRows, nCols);
    const cells = maze.getCells();
    const lastCell = cells[cells.length-3];
    // console.log(lastCell.getWalls());
    const neighs = lastCell.getAccessibleNeighbors();
    console.log(neighs)

    // const cell1 = cells[7]
    // const cell2 = cells[1]
    // const cs = [cell1, cell2]


    setupView(maze);
    Object.values(neighs).forEach((c)=>{
      if(c!==null){
        $(`#${c.row+'-'+c.col}`).css("background-color","blue")
      }

    })
});

function setupView(maze) {
    const maze$ = $('#maze');
    const templates$ = $('#templates');
    const cells = maze.getCells()
    const mazeCols = maze.cols;
    const mazeRows = maze.rows;

    maze$.css({
        'grid-template-rows': `repeat(${mazeRows}, 1fr)`,
        'grid-template-columns': `repeat(${mazeCols}, 1fr)`,
        width: mazeCols > mazeRows ? '80vw' : `${80 * mazeCols / mazeRows}vh` ,
        height: mazeRows >= mazeCols ? '80vh' : `${80 * mazeRows / mazeCols}vw` ,
    });

    const cell$ = templates$.find('.cell');

    cells.forEach((cell)=>{
      maze$.append(cell$.clone().attr('id', cell.row+'-'+cell.col));  //TODO; get rid of id
    })

    const firstCell$ = maze$.find('.cell').first();
    const firstWall$ = firstCell$.find('.walls');

    const mazePadding = (firstCell$.width()-firstWall$.width())/2;
    maze$.css('padding', mazePadding);
}

function displayMaze() {
    // TODO: Apply wall classes to cell divs based on maze data.
}
