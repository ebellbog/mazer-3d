import MazeEntity from './MazeEntity.js';
import Vertex from './Vertex.js';

const WallState = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    REMOVED: 'REMOVED'
}

class Wall extends MazeEntity {
    constructor(...args) {
        super(...args);

        this.state = (
                this.row === 0 || this.row === this.maze.rows*2 ||
                this.col === 0 || this.col === this.maze.cols*2
            ) ? WallState.CONFIRMED : WallState.PENDING;
    }

    getVertices() {
        const neighbors = this.getListOfNeighborsAtDist(1);
        const vertices = neighbors.filter((neighbor) => neighbor instanceof Vertex);
        return vertices;
    }

    isRemovable() {
        if (this.state !== WallState.PENDING) return false;

        const vertices = this.getVertices();
        for (let i = 0; i < 2; i++) {
            if (vertices[i].hasMaximumRemovedWalls()) {
                return false;
            }
        }
        return true;
    }

    shouldNotBeRemoved() {
        const endpoints = this.getVertices();
        for (let i = 0; i < 2; i++) {
            if (endpoints[i].supportsLoneWall()) return true;
        }
        return false;
    }
}

export {WallState}
export default Wall
