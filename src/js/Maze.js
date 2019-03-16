import './utils.js';
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

    generateMaze(randomize) {
        const cells = this.getCells();
        if (randomize) cells.shuffle();

        cells.forEach((cell) => cell.visit());
    }

    getVisitFunction(randomize) {
        const cells = this.getCells();
        if (randomize) cells.shuffle();

        let index = 0;
        return function(){ 
            if(index < cells.length){
                const cell = cells[index];
                cell.visit();
                index+=1;
            }
            return index ===cells.length ? false : true;
        }
    }

    /**
     * Calculate distance of all maze cells from cell at given index,
     * then use color to visualize distance.
     *
     * @param {number} cellIdx - Index of selected start cell.
     */
    colorByDistanceFromCell(cellIdx) {
        const cells = this.getCells();
        cells.forEach((cell) => cell.distance = null);

        const startCell = cells[cellIdx];
        startCell.distance = 0;

        let maxDist = 0;
        let frontierCells = [startCell];

        while (frontierCells.length) {
            const newFrontier = [];
            frontierCells.forEach((cell) => {
                const accessibleNeighbors = cell.getAccessibleNeighbors();
                const unvisitedAccessible = accessibleNeighbors.filter((neighbor) => neighbor.distance === null);
                unvisitedAccessible.forEach((unvisited) => {
                    unvisited.distance = cell.distance + 1;
                    maxDist = Math.max(maxDist, unvisited.distance);
                    newFrontier.push(unvisited);
                });
            });
            frontierCells = newFrontier;
        }

        // Set hue by normalized distance (i.e. fraction of max dist).
        cells.forEach((cell) => {
            cell.color = `hsl(${300 * cell.distance / maxDist}, 100%, 40%)`;
        });
    }
}

export default Maze;
