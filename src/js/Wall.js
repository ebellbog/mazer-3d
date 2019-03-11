import MazeEntity from './MazeEntity.js';

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
}

export {WallState}
export default Wall
