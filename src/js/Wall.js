import MazeEntity from './MazeEntity.js';

const WallState = {
    PENDING: 0,
    CONFIRMED: 1,
    REMOVED: 2
}

class Wall extends MazeEntity {
    constructor(...args) {
        super(...args);

        this.state = (
                this.row === 0 || this.row === this.maze.rows*2 ||
                this.col === 0 || this.col === this.maze.cols*2
            ) ? WallState.CONFIRMED : WallState.PENDING;
    }
}

export default Wall;