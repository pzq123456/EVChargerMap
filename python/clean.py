import pandas as pd

PATH = "data/alt_fuel_stations (Jul 13 2024).csv"
SAVE_PATH = "data/USApoints.csv"

def clean_data():
    # 仅仅保留如下列
    # ID,
    # City,
    # State,
    # Station Name,
    # Latitude,
    # Longitude,

    df = pd.read_csv(PATH)
    df = df[['ID', 'City', 'State', 'Station Name', 'Latitude', 'Longitude']]
    df.to_csv(SAVE_PATH, index=False)


# 统计 city 和 state 的充电站的数量 并制作csv
def count_data():
    df = pd.read_csv(SAVE_PATH)
    city_count = df['City'].value_counts()
    state_count = df['State'].value_counts()
    city_count.to_csv("data/city_count.csv")
    state_count.to_csv("data/state_count.csv")

# 1	阿拉巴马州	Alabama	AL
# 2	阿拉斯加州	Alaska	AK
# 3	亚利桑那州	Arizona	AZ
def clean_state():
    # 将 usa.txt 中的数据转换为 csv 只保留英文名和对应的缩写
    with open("data/usa.txt", "r") as f:
        data = f.readlines()
        data = [x.split("\t") for x in data]
        data = [[x[2], x[3]] for x in data]
        df = pd.DataFrame(data, columns=["State", "Abbreviation"])
        df.to_csv("data/usa.csv", index=False)


# EU 欧洲 data/eu/eu1.csv
PATH_EU = "data/eu/eu1.csv"
# X,Y,value,location_u,location_c,location_l,location_1,COUNTRY,NAME_1,NAME_2
def count_eu():
    # 统计国家的数量 并制作csv
    df = pd.read_csv(PATH_EU)
    country_count = df['COUNTRY'].value_counts()
    country_count.to_csv("data/eu/count.csv")

if __name__ == "__main__":
    # USA
    # clean_data()
    # print("Data cleaned and saved to", SAVE_PATH)
    # count_data()
    # clean_state()

    # EU
    count_eu()