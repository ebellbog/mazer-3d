import MazeEntity from './MazeEntity.js';

class Cell extends MazeEntity {
    constructor(...args) {
        super(...args);

        this.score = 0;
        this.visited = false;

        //TODO: figure out how to store backprop visited state
    }

    //TODO: Decide best place to implement visit cell logic

    /**
     * @returns {Array.<Cell>} List of neighboring cells
     */
    getNeighbors() {
        const data = this.maze.data, row = this.row, col = this.col;
        return {
          left: col > 1? data[row][col-2] : null,
          right: col < data[0].length - 2 ? data[row][col+2] : null,
          top: row > 1 ? data[row-2][col] : null,
          bottom: row < data.length - 2 ? data[row+2][col] : null
        }
    }

    /**
     * @param {Cell} cell
     * @returns {boolean} Represents whether there is a removed wall between cells
     */
    canAccessCell(cell){

    }

    /**
     * @returns {Array.<Cell>} List of neighboring cells that are accessible
     */
    getAccessibleNeighbors(){

    }

    /**
     * @returns {Array.<number>} An array of two representing the lower and upper bounds of (previously pending) walls we are permitted to remove
     */
    getWallRemovalRange(){

    }

    /**
     * @returns {Object} Dictionary of walls surrounding this cell
     */
    getWalls() {
        const data = this.maze.data;
        return {
            left: data[this.row][this.col-1],
            right: data[this.row][this.col+1],
            top: data[this.row-1][this.col],
            bottom: data[this.row+1][this.col]
        }
    }
}

export default Cell;