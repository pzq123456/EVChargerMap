import os
import pandas as pd
import tqdm
import numpy as np

import json
import math



PATH = os.path.dirname(__file__)

SAVE_PATH = os.path.join(PATH, "merge.csv")

# SAVE_PATH2 = os.path.join(PATH, "cn_grid.json")

SAVE_PATH2 = "/Users/panzhiqing/Desktop/EVChargerMap/data/cn_grid.json"

NAMES = ["香港","宁夏","新疆","西藏","湖北", 
         "云南","安徽","江西","甘肃","河南",
         "湖南","辽宁","广西","吉林","山西",
         "青海","山东","重庆","贵州","江苏",
         "河北","四川","福建","海南","陕西",
         "广东","内蒙古自治区","浙江","黑龙江",
         "上海","北京","天津","澳门","台湾",]

def findPath(PATH, province):
    # 寻找每一个省份对应文件夹下 后缀为 csv 的文件的路径
    provincePath = os.path.join(PATH, province)
    for root, dirs, files in os.walk(provincePath):
        for file in files:
            if file.endswith(".csv"):
                return os.path.join(root, file)
    return None

def readCSV(path):
    # 读取csv文件 仅仅保留 wgs84_lng,wgs84_lat 两列
    df = pd.read_csv(path, encoding="GB18030")
    return df[["wgs84_lat","wgs84_lng"]]

def merge():
    # 合并所有省份的数据
    df = pd.DataFrame()
    for name in tqdm.tqdm(NAMES):
        # tqdm print name
        tqdm.tqdm.write(name)
        path = findPath(PATH, name)
        if path:
            df = pd.concat([df, readCSV(path)])
    
    tqdm.tqdm.write("Save to merge.csv")
    df.to_csv(SAVE_PATH, index=False)
    tqdm.tqdm.write("Done")

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

# def createGrid():
#     # 生成网格数据
#     df = pd.read_csv(SAVE_PATH)
#     grid = Grid()
#     points = df.values.tolist()
#     grid.insert_points(points)
#     grid_json = grid.to_json()
#     with open(SAVE_PATH2, "w") as f:
#         f.write(grid_json)

# 向量化计算网格数据
def createGrid():
    # 生成网格数据
    # df = pd.read_csv(SAVE_PATH)
    # 测试时只取前 100 个点
    df = pd.read_csv(SAVE_PATH)
    grid = Grid()
    points = df.values
    grid.insert_points(points)
    grid_json = grid.to_json()
    with open(SAVE_PATH2, "w") as f:
        f.write(grid_json)


if __name__ == "__main__":
    merge()
    createGrid()

