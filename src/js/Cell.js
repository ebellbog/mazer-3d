import {randInt} from './utils';
import MazeEntity from './MazeEntity.js';
import {WallState} from './Wall.js'

class Group {
    constructor(cell) {
        this.accessibleUnvisitedCells = new Set([cell]);
        this.memberCells = [cell];
        this.color = `rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})`;
    }

    mergeWithGroup(group) {
        const [deprecatedGroup, persistingGroup] = [this, group].sort((a,b) => a.memberCells.length > b.memberCells.length ? 1 : -1);
        deprecatedGroup.memberCells.forEach((cell) => cell.group = persistingGroup);
        persistingGroup.memberCells = persistingGroup.memberCells.concat(deprecatedGroup.memberCells);
    }
}

class Cell extends MazeEntity {
    constructor(...args) {
        super(...args);

        this.group = new Group(this);
        this.visited = false;
    }

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

    canAccessCell(cell) {
        return (
            this.isNeighboringCell(cell)
            && this.getInterveningWall(cell).state === WallState.REMOVED
        )
    }

    getInterveningWall(cell) {
        if (this.isNeighboringCell(cell)) {
            return this.maze.data[(this.row + cell.row) / 2][(this.col + cell.col) / 2]
        }
        return null;
    }

    isNeighboringCell(cell) {
        return this.getNeighboringCells().includes(cell);
    }

    /**
     * @returns {Array.<Cell>} List of neighboring cells that are accessible
     */
    getAccessibleNeighbors() {
        return this.getNeighboringCells().filter((c) => this.canAccessCell(c))
    }

    getUniqueNeighboringGroups(onlyVisited) {
        let accessibleNeighbors = this.getAccessibleNeighbors()
        if (onlyVisited) accessibleNeighbors = accessibleNeighbors.filter((neighbor) => neighbor.visited)

        return accessibleNeighbors.reduce((acc, neighbor)=>{
            return acc.includes(neighbor.group) ? acc : acc.concat([neighbor.group])
        }, []);
    }

    /**
     * @returns {Object} Dictionary of walls surrounding this cell
     */
    getWalls() {
        return this.getDictOfNeighborsAtDist(1)
    }

    removeAtLeastNWalls(minimumWallsToRemove){
        const walls = Object.values(this.getWalls()).shuffle();

        // Move walls that shouldn't be removed later in list, to decrease chance of removal.
        walls.sort((a, b) => a.shouldNotBeRemoved() && !b.shouldNotBeRemoved() ? 1 : -1);

        const removableWalls = walls.filter((wall)=>wall.isRemovable())
        const numberOfWallsToRemove = randInt(minimumWallsToRemove, removableWalls.length);

        let removedWalls = 0;
        walls.forEach((wall)=>{
            if(wall.state==WallState.PENDING){
                if (removableWalls.includes(wall) && removedWalls < numberOfWallsToRemove) {
                    if (wall.shouldNotBeRemoved() && removedWalls > minimumWallsToRemove) {
                        wall.state = WallState.CONFIRMED;
                        return;
                    }
                    wall.state = WallState.REMOVED;
                    removedWalls++;
                } else {
                    wall.state = WallState.CONFIRMED
                }
            }
        });
    }

    visit() {
        // Get the groups that will be merged with this cell. For each one,
        // this cell no longer counts as an "accessible unvisited cell", so
        // delete it from their records.
        let neighboringGroups = this.getUniqueNeighboringGroups();
        neighboringGroups.forEach(
                (group)=> group.accessibleUnvisitedCells.delete(this)
        )

        // If the merged group which includes this cell already has access to
        // a least one unvisited cell, then we don't need to remove any walls.
        // If it does NOT have access to at least one unvisited cell, we need
        // to maintain access by deleting at least one wall.
        const minWallsToRemove =
            getAllAccessibleUnvisitedCells(neighboringGroups).size ? 0 : 1;

        // Remove at least the specified number of walls.
        this.removeAtLeastNWalls(minWallsToRemove)

        // Now that we've removed some walls, re-calculate the neighboring
        // groups to include those that we have just gained access to.
        // Once we merge, we'll want the newly merged group to count, among its
        // "accessible unvisited cells", anything accessible via these neighboring
        // groups
        neighboringGroups = this.getUniqueNeighboringGroups();
        const newAllUnvisited = getAllAccessibleUnvisitedCells(neighboringGroups)

        // Perform the merge & update the "accessible unvisited cells"
        this.getUniqueNeighboringGroups(true)
            .forEach((group) => this.group.mergeWithGroup(group));
        this.group.accessibleUnvisitedCells = newAllUnvisited;

        // Mark this cell as visited
        this.visited = true;
    }

}

function getAllAccessibleUnvisitedCells(groups){
    const allUnvisitedCells = new Set();
    groups.forEach((group) => {
        group.accessibleUnvisitedCells.forEach((cell)=>{
            allUnvisitedCells.add(cell)
        })
    });
    return allUnvisitedCells;
}

export default Cell;
