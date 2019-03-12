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
    getNeighboringCells() {
        return this.getListOfNeighborsAtDist(2)
    }

    /**
     * @param {Cell} cell
     * @returns {boolean} Represents whether there is a removed wall between cells
     */
    canAccessCell(cell){
      return (
          cell.visited==false
          && this.isNeighboringCell(cell)
          && this.getInterveningWall(cell).state === WallState.REMOVED
      )
    }

    getInterveningWall(cell){
      if(this.isNeighboringCell(cell)){
        return this.maze.data[(this.row+cell.row)/2][(this.col+cell.col)/2]
      }
      return null;
    }

    isNeighboringCell(cell){
      return this.getNeighboringCells().includes(cell);
    }

    /**
     * @returns {Array.<Cell>} List of neighboring cells that are accessible
     */
    getAccessibleNeighbors(){
      return this.getNeighboringCells().filter((c)=>c&&this.canAccessCell(c))
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
        return this.getDictOfNeighborsAtDist(1)
    }
}

export default Cell;
