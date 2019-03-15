import MazeEntity from './MazeEntity.js';
import {WallState} from './Wall.js'

class Vertex extends MazeEntity {
    constructor(...args) {
        super(...args);
    }

    getOutgoingWalls() {
        return this.getListOfNeighborsAtDist(1)
    }

    // The maximum number of outgoing walls a vertex can have in the REMOVED
    // state is 3.
    hasMaximumRemovedWalls() {
        return this.getOutgoingWalls()
            .filter((wall) => wall.state === WallState.REMOVED)
            .length >= 3
    }

    // Call this function on both endpoints, when considering whether to remove a PENDING wall.
    // It is a recommendation, rather than a hard rule.
    shouldNotRemoveWalls() {
        const walls = this.getOutgoingWalls();
        const confirmedWalls = walls.filter((wall) => wall.state === WallState.CONFIRMED);
        const pendingWalls = walls.filter((wall) => wall.state === WallState.PENDING);

        // If at least 2 confirmed walls, there can't be a lone wall.
        // If 0, it's possible there could be a lone wall later down the road...
        if (confirmedWalls.length !== 1) return false;

        // If another wall which *could* be confirmed in the future, we're safe for now.
        if (pendingWalls.length > 1) return false;

        const wall = confirmedWalls[0];
        const vertices = wall.getVertices();

        // Get vertex at other end of wall.
        for (let i = 0; i < 2; i++) {
            const vertex = vertices[i];
            if (vertex === this) continue;

            // Check whether wall is (or could be) supported at its other vertex.
            const removedWalls = vertex.getOutgoingWalls().filter((wall) => wall.state === WallState.REMOVED);
            if (removedWalls.length === 3) return true;
        }

        return false;
    }
}

export default Vertex;
