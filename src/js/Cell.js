import MazeEntity from './MazeEntity.js';
import {WallState} from './Wall.js'

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
        //TODO: this can probably just be an array?
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
      return (
          cell.visited==false
          && this.isNeighboringCell(cell)
          && this.getInterveningWall(cell).state === WallState.PENDING
      )
    }

    getInterveningWall(cell){
      if(this.isNeighboringCell(cell)){
        return this.maze.data[(this.row+cell.row)/2][(this.col+cell.col)/2]
      }
      return null;
    }

    isNeighboringCell(cell){
      const isNeighboringCoordinateSet = (x1,x2,y1,y2) => (x1==x2 && Math.abs(y1-y2) == 2)
      return (
          isNeighboringCoordinateSet(this.row, cell.row, this.col, cell.col)
          || isNeighboringCoordinateSet(this.col, cell.col, this.row, cell.row)
      )
    }

    /**
     * @returns {Array.<Cell>} List of neighboring cells that are accessible
     */
    getAccessibleNeighbors(){
      return Object.values(this.getNeighbors()).filter((c)=>c&&this.canAccessCell(c))
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
