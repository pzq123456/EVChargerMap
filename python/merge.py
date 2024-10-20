import os
import pandas as pd
import tqdm

from grid import Grid

# location_l,location_1

# data\eu\eu.csv
# 当前目录的上一级目录
PATH = os.path.join(os.path.dirname(__file__), "..", "data", "eu")
PATH1 = os.path.join(PATH, "eu.csv")

SAVE_PATH = os.path.join(PATH, "..", "eu_grid.json")

# 向量化计算网格数据
def createGrid():
    # 生成网格数据
    # df = pd.read_csv(SAVE_PATH)
    # 测试时只取前 100 个点
    df = pd.read_csv(PATH1)
    # 仅取 location_l,location_1 两列
    df = df[["location_l", "location_1"]]
    grid = Grid()
    points = df.values
    grid.insert_points(points)
    grid_json = grid.to_json()
    with open(SAVE_PATH, "w") as f:
        f.write(grid_json)


if __name__ == "__main__":
    createGrid()
    print("网格数据生成完成")

