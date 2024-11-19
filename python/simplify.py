import os
import geojson
import geopandas as gpd

DIR = os.path.dirname(__file__)

PATH = os.path.join(DIR, '..', 'data', 'GeoJSON', 'C')
SAVE_PATH = os.path.join(DIR, '..', 'data', 'GeoJSON', 'C')

names = ['C_eu.geojson','C_cn.geojson','C_us.geojson']
savenames = ['C_eu_sim.geojson','C_cn_sim.geojson','C_us_sim.geojson']

def simplify_geojson(path, save_path):
    gdf = gpd.read_file(path)
    gdf['geometry'] = gdf['geometry'].simplify(0.01)
    gdf.to_file(save_path, driver='GeoJSON')
    

# data\GeoJSON\C\C_eu_no_null.geojson
if __name__ == '__main__':
    # 仅仅简化 eu
    path = os.path.join(PATH, names[0])
    save_path = os.path.join(SAVE_PATH, savenames[0])
    simplify_geojson(path, save_path)
    print(f'{names[0]} simplified and saved as {savenames[0]}')
    print('All done!')  # 3个文件都简化完母了
    #  现在开始简化 跳过 eu
    # for i in range(1, 3):
    #     path = os.path.join(PATH, names[i])
    #     save_path = os.path.join(SAVE_PATH, savenames[i])
    #     simplify_geojson(path, save_path)
    #     print(f'{names[i]} simplified and saved as {savenames[i]}')
    # print('All done!')  # 3个文件都简化完母了