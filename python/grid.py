import json
import math

class Grid:
    def __init__(self, gridBounds=None, cellWidth=1, cellHeight=1):
        if gridBounds is None:
            gridBounds = {'x': -180, 'y': -90, 'w': 360, 'h': 180}
        self.gridBounds = gridBounds
        self.cellWidth = cellWidth
        self.cellHeight = cellHeight
        self.grid = {}

    def insert_points(self, points):
        for point in points:
            x, y = point
            # Calculate which grid cell the point belongs to
            gridX = math.floor((x - self.gridBounds['x']) / self.cellWidth)
            gridY = math.floor((y - self.gridBounds['y']) / self.cellHeight)
            key = f"{gridX},{gridY}"
            
            # Initialize the grid cell if it doesn't exist
            if key not in self.grid:
                self.grid[key] = {
                    'center': self.get_grid_center(gridX, gridY),
                    'count': 0
                }
            
            # Increment the point count for this grid cell
            self.grid[key]['count'] += 1

    def get_grid_center(self, gridX, gridY):
        return {
            'x': self.gridBounds['x'] + gridX * self.cellWidth + self.cellWidth / 2,
            'y': self.gridBounds['y'] + gridY * self.cellHeight + self.cellHeight / 2
        }

    def get_sparse_grid(self):
        return self.grid

    def to_json(self):
        return json.dumps({
            'gridBounds': self.gridBounds,
            'cellWidth': self.cellWidth,
            'cellHeight': self.cellHeight,
            'grid': self.grid
        })

if __name__ == '__main__':

    # Example usage:
    grid = Grid()
    points = [
        (-170, -80), (-170, -80), (-170, -80), (-160, -70),
        (-160, -75), (-155, -72), (-170, -82)
    ]
    grid.insert_points(points)

    # Generate JSON for the frontend
    grid_json = grid.to_json()
    print(grid_json)
