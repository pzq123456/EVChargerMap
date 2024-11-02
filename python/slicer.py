# GeoJson 分块 将大的geojson文件为多个小的geojson文件
import geopandas as gpd
import os
import tqdm

PATH = os.path.dirname(os.path.abspath(__file__))
#  '..', 'data', 'GeoJSON','C'
PATH = os.path.join(PATH, '..', 'data', 'GeoJSON','C')

PATH1 = os.path.join(PATH, 'C_eu.geojson')
PATH2 = os.path.join(PATH, 'C_cn.geojson')
PATH3 = os.path.join(PATH, 'C_us.geojson')

SAVE_PATH = os.path.join(PATH, 'C_eu_{}.geojson')

# 剔除某一字段为空的数据
def drop_null(file_path, column, null_value, save_path):
    """
    :param file_path: str, geojson file path
    :param column: str, column name
    :param null_value: any, null value
    :param save_path: str, save path
    :return:
    """
    gdf = gpd.read_file(file_path)
    gdf = gdf[gdf[column] != null_value]
    gdf.to_file(save_path, driver='GeoJSON')


def split_geojson(file_path, save_path, num):
    """
    :param file_path: str, geojson file path
    :param save_path: str, save path
    :param num: int, split number
    :return:
    """
    gdf = gpd.read_file(file_path)
    length = len(gdf)
    step = length // num

    for i in tqdm.tqdm(range(num)):
        start = i * step
        end = (i + 1) * step
        if i == num - 1:
            end = length
        gdf[start:end].to_file(save_path.format(i), driver='GeoJSON')

# 按照字段汇总为 CSV 文件 也就是将某一字段相同的数据合并到一起

if __name__ == '__main__':
    # print(PATH1)
    # split_geojson(PATH1, SAVE_PATH, 10)

    # drop_null(PATH1, 'V', 0.0, os.path.join(PATH, 'C_eu_no_null.geojson'))
    drop_null(PATH2, 'V', 0.0, os.path.join(PATH, 'C_cn_no_null.geojson'))
    drop_null(PATH3, 'V', 0.0, os.path.join(PATH, 'C_us_no_null.geojson'))
