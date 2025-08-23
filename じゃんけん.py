import random
hands = ["グー","チョキ","パー"]
computer = random.choice(hands)
user_hands = input("グー,チョキ,パーのいずれかを入力")
print(f"コンピュータの手は{computer}でした")

if user_hands == computer:
    print("あいこ")
elif(user_hands == "グー" and computer == "チョキ") or (user_hands == "チョキ" and computer == "パー") or (user_hands == "パー" and computer == "グー"):
    print("あなたの勝ち")
else:
    print("あなたのまけ")
   



