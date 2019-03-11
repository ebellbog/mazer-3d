class MazeEntity {
    constructor(maze, row, col) {
        Object.assign(this, {maze, row, col});
    }
    getNeighboringEntitiesDict(distance){
      const data = this.maze.data, row = this.row, col = this.col;
      return {
        'left': col > (distance-1)? data[row][col-distance] : null,
        'right': col < data[0].length - distance ? data[row][col+distance] : null,
        'top':  row > (distance-1) ? data[row-distance][col] : null,
        'bottom': row < data.length - distance ? data[row+distance][col] : null
      }
    }
    getNeighboringEntitiesList(distance){
      return Object.values(this.getNeighboringEntitiesDict(distance))
    }
}

export default MazeEntity;
