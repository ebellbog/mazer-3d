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

    visit() {
        // Figure out whether we need to delete at least one wall.
        let groups = this.getUniqueNeighboringGroups();

        // This cell no longer counts as an invisited cell
        groups.forEach((group)=> group.accessibleUnvisitedCells.delete(this))

        //Between the groups that are about to be merged, how many outlets are there? 
        const allUnvisitedCells = new Set();
        groups.forEach((group) => {
            group.accessibleUnvisitedCells.forEach((cell)=>{
                allUnvisitedCells.add(cell)
            })
        });

        const totalUnvisited = allUnvisitedCells.size;
        const minimumWallsToRemove = totalUnvisited ? 0 : 1;

        // Actually remove some walls.
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

        // Update scores and merge groups
        const newNeighbors = this.getUniqueNeighboringGroups();
        const newAllUnvisited = new Set();
        newNeighbors.forEach((group)=>{
            group.accessibleUnvisitedCells.forEach((unvisitedCell) => {
                newAllUnvisited.add(unvisitedCell);
            })
        })

        this.getUniqueNeighboringGroups(true).forEach((group) => this.group.mergeWithGroup(group));
        this.group.accessibleUnvisitedCells = newAllUnvisited;

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

export default Cell;
