import pandas as pd
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

# 获取最大最小值 根据给定的数量分割 间断点
def get_breaks(df, column, num_breaks):
    breaks = pd.cut(df[column], num_breaks, retbins=True)[1]
    return breaks

# test
if __name__ == '__main__':
    df = pd.read_csv(PATH_STATES)
    breaks = get_breaks(df, 'count', 8)