import Cell from './Cell.js';
import Wall from './Wall.js';
import Vertex from './Vertex.js';

class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        const dataTypes = [
            [Vertex, Wall],
            [Wall, Cell]
        ];

        for (let r = 0; r < 2*rows+1; r++) {
            const row = [];
            for (let c = 0; c < 2*cols+1; c++) {
                // Initialize each entity with its coordinates and a reference to the maze.
                row.push(new dataTypes[r%2][c%2](this, r, c));
            }
            this.data.push(row);
        }
    }

    getCells() {
        return this.data.reduce((cells, row) => {
            return cells.concat(row.filter((entity) => entity instanceof Cell));
        }, []);
    }
}

export default Maze;
