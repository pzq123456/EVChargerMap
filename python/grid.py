import json
import numpy as np

class Grid:
    def __init__(self, gridBounds=None, cellWidth=1, cellHeight=1):
        if gridBounds is None:
            gridBounds = {'x': -180, 'y': -90, 'w': 360, 'h': 180}
        self.gridBounds = gridBounds
        self.cellWidth = cellWidth
        self.cellHeight = cellHeight
        self.grid = {}

    def insert_points(self, points):
        # 将点数组转换为 numpy 数组
        points = np.array(points)
        x_coords, y_coords = points[:, 0], points[:, 1]

        # 计算每个点所在的网格单元坐标
        gridX = np.floor((x_coords - self.gridBounds['x']) / self.cellWidth).astype(int)
        gridY = np.floor((y_coords - self.gridBounds['y']) / self.cellHeight).astype(int)

        # 生成唯一的网格单元键值对
        keys = [f"{gx},{gy}" for gx, gy in zip(gridX, gridY)]

        # 使用 numpy 进行批量操作，避免循环
        unique_keys, counts = np.unique(keys, return_counts=True)

        for i, key in enumerate(unique_keys):
            # 计算网格中心
            gx, gy = map(int, key.split(','))
            if key not in self.grid:
                self.grid[key] = {
                    'center': self.get_grid_center(gx, gy),
                    'count': 0
                }

            # 增加计数
            self.grid[key]['count'] += counts[i]

    def get_grid_center(self, gridX, gridY):
        return {
            'x': self.gridBounds['x'] + gridX * self.cellWidth + self.cellWidth / 2,
            'y': self.gridBounds['y'] + gridY * self.cellHeight + self.cellHeight / 2
        }

    def get_sparse_grid(self):
        return self.grid

    def to_json(self):
            # 手动将数据转换为 Python 的基本数据类型，避免 JSON 序列化时的类型错误
            return json.dumps({
                'gridBounds': self.gridBounds,
                'cellWidth': self.cellWidth,
                'cellHeight': self.cellHeight,
                'grid': self.grid
            }, default=self.convert_to_builtin_type, indent=4)

    @staticmethod
    def convert_to_builtin_type(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

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
