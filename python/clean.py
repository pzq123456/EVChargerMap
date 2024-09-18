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

if __name__ == "__main__":
    clean_data()
    print("Data cleaned and saved to", SAVE_PATH)