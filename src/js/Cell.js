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
        return this.getNeighboringEntitiesList(2)
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
      return this.getNeighbors().filter((c)=>c&&this.canAccessCell(c))
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
        return this.getNeighboringEntitiesDict(1)
    }
}

export default Cell;
