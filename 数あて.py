import random

answer = random.randint(1,10)
guest = int (input("1~10の数をあてて"))
if guest == answer:
    print("正解！")
else:
    print("不正解！正解は",answer)