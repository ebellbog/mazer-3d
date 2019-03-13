import MazeEntity from './MazeEntity.js';
import {WallState} from './Wall.js'

class Group {
    constructor(cell) {
        this.score = 1;
        this.memberCells = [cell];
    }

    // TODO: consider moving score management into this method
    mergeWithGroup(group) {
        const [deprecatedGroup, persistingGroup] = [this, group].sort((a,b) => a.memberCells.length > b.memberCells.length ? 1 : -1);
        //console.log("Deprecated", deprecatedGroup.memberCells, 'Persisting', persistingGroup.memberCells);
        deprecatedGroup.memberCells.forEach((cell) => cell.group = persistingGroup);
        persistingGroup.memberCells = persistingGroup.memberCells.concat(deprecatedGroup.memberCells);
        //console.log(persistingGroup.memberCells);
    }
}

class Cell extends MazeEntity {
    constructor(...args) {
        super(...args);

        this.group = new Group(this);
        this.visited = false; //TODO: is thios actually used?

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
          this.isNeighboringCell(cell)
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
      return this.getNeighboringCells().filter((c)=>this.canAccessCell(c))
    }

    getUniqueNeighboringGroups(onlyVisited){
        let accessibleNeighbors = this.getAccessibleNeighbors()
        if (onlyVisited) accessibleNeighbors = accessibleNeighbors.filter((neighbor) => neighbor.visited)

        return accessibleNeighbors.reduce((acc, neighbor)=>{
            return acc.includes(neighbor.group) ? acc : acc.concat([neighbor.group])
        }, []);
    }

    visit(){
        // Figure out whether we need to delete at least one wall.
        let groups = this.getUniqueNeighboringGroups();
        groups.forEach((group)=> group.score-=1)
        const total = groups.reduce((acc,group)=> acc+group.score, 0) //TODO: double check that we should not be double counting group scores
        const minimumWallsToDelete = total===0? 1 : 0

        // Actually remove some walls.
        const walls = shuffle(Object.values(this.getWalls()));
        const removableWalls = walls.filter((wall)=>wall.isRemovable())
        const numberOfWallsToRemove = getRndInteger(minimumWallsToDelete, removableWalls.length) //is it possible for these to be switched

        // console.log('minimumWallsToDelete', minimumWallsToDelete)
        // console.log('maximumWallsToDelete', removableWalls.length)
        // console.log('numberOfWallsToRemove', numberOfWallsToRemove)
        if (removableWalls.length < minimumWallsToDelete) console.log(`\n\n\n\nVisiting cell at R${this.row}, C${this.col}`)
        let removedWalls = 0;
        walls.forEach((wall)=>{
            if(wall.state==WallState.PENDING){
                if(removableWalls.includes(wall) && removedWalls < numberOfWallsToRemove){
                    wall.state = WallState.REMOVED;
                    removedWalls+=1;
                }
                else{
                    wall.state = WallState.CONFIRMED
                }
            }
        })

        // Update scores and merge groups
        groups = this.getUniqueNeighboringGroups();
        const score = groups.reduce((acc,group)=> acc+group.score, 0);

        this.getUniqueNeighboringGroups(true).forEach((group) => this.group.mergeWithGroup(group));
        this.group.score = score;

        // Mark visited
        this.visited = true;
    }


    /**
     * @returns {Object} Dictionary of walls surrounding this cell
     */
    getWalls() {
        return this.getDictOfNeighborsAtDist(1)
    }
}

//TODO: move to utils
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// min inclusive max inclusive
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) ) + min;
}
export default Cell;
