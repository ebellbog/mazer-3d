import './utils.js';
import Cell from './Cell.js';
import Wall from './Wall.js';
import Vertex from './Vertex.js';

class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        this.visitedCellsCount = 0;

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

    generateMaze() {
        if (this.visitedCellsCount > 0) return;
        while (this.generateNextCell()) {}
    }

    generateNextCell() {
        const cells = this.getCells();
        if (this.visitedCellsCount === cells.length) return false;

        const cell = cells[this.visitedCellsCount];
        cell.visit();
        this.visitedCellsCount++;

        return true;
    }

    /**
     * Generic implementation of breadth-first search. Returns nothing, but exposes
     * customizable functionality via callback function.
     *
     * @param {Cell} startCell - Cell to begin searching outwards from.
     * @param {Function} callback - Takes parent Cell, followed by its child Cell.
     */
    breadthFirstSearch(startCell, callback) {
        const distanceDict = {};
        const visitedCells = new Set([startCell]);

        let frontierCells = [startCell];

        while (frontierCells.length) {
            const newFrontier = [];
            frontierCells.forEach((cell) => {
                const accessibleNeighbors = cell.getAccessibleNeighbors();
                const unvisitedAccessible = accessibleNeighbors.filter((neighbor) => !visitedCells.has(neighbor));

                unvisitedAccessible.forEach((unvisited) => {
                    callback(cell, unvisited)
                    newFrontier.push(unvisited);
                    visitedCells.add(unvisited);
                });
            });
            frontierCells = newFrontier;
        }
    }

    /**
     * Calculate distance of all maze cells from cell at given index,
     * then use color to visualize distance.
     *
     * @param {number} startIdx - Index of selected start cell.
     * @returns {Object.<Cell, number>} Dictionary of distances from start cell.
     */
    getDistanceDict(startIdx){
        const startCell = this.getCells()[startIdx];
        const distanceDict = {}
        distanceDict[startCell] = 0;

        this.breadthFirstSearch(startCell, (parent, child)=>{
            distanceDict[child] = distanceDict[parent] + 1;
        });

        return distanceDict;
    }

    /**
     * Uses breadth-first search to find the shortest path between two cells.
     *
     * @param {number} startIdx - Index of start cell.
     * @param {number} endIdx - Index of end cell.
     * @returns {Array} List of cells in shortest path (including start and end cell).
     */
    getShortestPathData(startIdx, endIdx){
        const cells = this.getCells();
        const startCell = cells[startIdx];
        const endCell = cells[endIdx];

        const previousDict = {}
        previousDict[startCell] = null;

        this.breadthFirstSearch(startCell, (parent, child) => {
            previousDict[child] = parent;
        });

        const path = [];

        let prevCell = endCell;
        while (prevCell !== null) {
            path.unshift(prevCell)
            prevCell = previousDict[prevCell];
        }

        return path;
    }
}

export default Maze;
