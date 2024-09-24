# 读取 GeoJSON 文件
import json
import pandas as pd

PATH = 'data/us-states.json'
# e.g.
    # {
    #     "type": "Feature",
    #     "id": "01",
    #     "properties": {
    #         "name": "Alabama",
    #         "density": 94.65
    #     },
    #     "geometry": {
    #         "type": "Polygon",
    #         "coordinates": [[[-87.359296, 35.00118], [-85.606675, 34.984749], [-85.431413, 34.124869], [-85.184951, 32.859696], [-85.069935, 32.580372], [-84.960397, 32.421541], [-85.004212, 32.322956], [-84.889196, 32.262709], [-85.058981, 32.13674], [-85.053504, 32.01077], [-85.141136, 31.840985], [-85.042551, 31.539753], [-85.113751, 31.27686], [-85.004212, 31.003013], [-85.497137, 30.997536], [-87.600282, 30.997536], [-87.633143, 30.86609], [-87.408589, 30.674397], [-87.446927, 30.510088], [-87.37025, 30.427934], [-87.518128, 30.280057], [-87.655051, 30.247195], [-87.90699, 30.411504], [-87.934375, 30.657966], [-88.011052, 30.685351], [-88.10416, 30.499135], [-88.137022, 30.318396], [-88.394438, 30.367688], [-88.471115, 31.895754], [-88.241084, 33.796253], [-88.098683, 34.891641], [-88.202745, 34.995703], [-87.359296, 35.00118]]]
    #     }
    # },
SAVE_PATH = 'data/us-states-new.json'

# USA 编码与名称对照表
# data\usa.csv
# e.g.
# Alabama,AL
# Alaska,AK
# Arizona,AZ
# Arkansas,AR
# California,CA
# Colorado,CO
# Connecticut,CT
PATH_CODE_NAME = 'data/usa.csv'
# USA 各个州 统计数据
# data\state_count.csv
# e.g 
# State,count
# CA,15937
# NY,4121
# FL,3421
# TX,3314
# MA,3103
# CO,2188
PATH_STATES = 'data/state_count.csv'

def read_geojson(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

# 提取并遍历 GeoJSON 文件中的要素 Fearures
def extract_features(data):
    for feature in data['features']:
        print(feature)

# 便利 GeoJSON 文件中的要素 Properties
def loop_properties(data, customFn=None):
    # for feature in data['features']:

    # 便利并将 customFn 作用于 Properties 并将结果插入到 Properties 中
    for feature in data['features']:
        properties = feature['properties']
        if customFn:
            properties = customFn(properties)
        # print(properties)
            

    return data



def save_geojson(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f)

def mearge_data(df, df_states):
    df = pd.read_csv(PATH_CODE_NAME)
    # 获取 USA 各个州 统计数据
    # 更具 State 和 Abbreviation 合并两个表
    df = pd.merge(df, df_states, left_on='Abbreviation', right_on='State')
    return df


if __name__ == '__main__':
    df = pd.read_csv(PATH_CODE_NAME)
    df_states = pd.read_csv(PATH_STATES)
    mearged_data = mearge_data(df, df_states)
    print(mearged_data)
    data = read_geojson(PATH)
    # # # extract_features(data)
    def customFn(properties):
        # properties['count'] = properties['name']
        # 将name与 merge_data 中的 State 合并 获取对应的 count
        name = properties['name']
        count = mearged_data[mearged_data['State_x'] == name]['count']
        properties['count'] = count.to_string(index=False)
    data = loop_properties(data, customFn)
    print(data)
    save_geojson(data, SAVE_PATH)
