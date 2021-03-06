class MazeEntity {
    constructor(maze, row, col) {
        Object.assign(this, {maze, row, col});
    }

    /**
     * Override toString to ensure unique key for object in hashtable.
     */
    toString() {
        return `${this.constructor.name}_${this.row}_${this.col}`;
    }

    getDictOfNeighborsAtDist(distance) {
        const data = this.maze.data, row = this.row, col = this.col;
        return {
            'left': col > (distance - 1) ? data[row][col - distance] : null,
            'right': col < data[0].length - distance ? data[row][col + distance] : null,
            'top': row > (distance - 1) ? data[row - distance][col] : null,
            'bottom': row < data.length - distance ? data[row + distance][col] : null
        }
    }

    getListOfNeighborsAtDist(distance) {
        return Object.values(this.getDictOfNeighborsAtDist(distance)).filter((x) => x !== null)
    }
}

export default MazeEntity;
