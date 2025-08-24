import time
import random

sec = random.randint(1,10)

input("Enterキーを押して")
start = time.time()
input ("Enterキーを押して")
end = time.time()
elapsed = end - start
time = sec -elapsed

if time <1:
    print(f"ほぼ一致経過時間は{elapsed:2f}です")
    print(f"正解は{sec}秒でした")
else:
    print(f"経過時間は{elapsed:2f}です")
    print(f"残念！正解は{sec}秒でした")

