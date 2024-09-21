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

if __name__ == "__main__":
    # clean_data()
    # print("Data cleaned and saved to", SAVE_PATH)
    count_data()