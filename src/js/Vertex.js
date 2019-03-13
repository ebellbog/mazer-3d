import MazeEntity from './MazeEntity.js';
import {WallState} from './Wall.js'

class Vertex extends MazeEntity {
    constructor(...args) {
        super(...args);
    }

    getOutgoingWalls(){
      return this.getListOfNeighborsAtDist(1)
    }

    // The maximum number of outgoing walls a vertex can have in the REMOVED
    // state is 3.
    hasMaximumRemovedWalls(){
      return this.getOutgoingWalls()
        .filter((wall)=>wall.state==WallState.REMOVED)
        .length >= 3
    }
}

export default Vertex;
