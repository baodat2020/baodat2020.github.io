---
title: Phân tích Div.2 — Tư duy giải toán từ quan sát đến thuật toán
date: 2026-03-14
tag: cp
excerpt: Walk-through chi tiết Codeforces Round 998 (Div. 2). Làm sao để chuyển hóa những quan sát vụn vặt thành thuật toán tối ưu?
readTime: 15 phút
image: assets/thumbnail_cf.png
---

# Phân tích Div.2 — Tư duy giải toán từ quan sát đến thuật toán

Trong thế giới Competitive Programming, các kỳ thi **Codeforces Div.2** luôn là "thử thách vàng" để rèn luyện khả năng quan sát và tối ưu hóa. Khác với Div.1 tập trung vào các cấu trúc dữ liệu hạng nặng, Div.2 thường yêu cầu bạn phải nhận ra những "tính chất ẩn" (observations) từ những bài toán trông có vẻ đơn giản.

Hôm nay, mình sẽ cùng các bạn "mổ xẻ" chi tiết một contest điển hình (**Codeforces Round 998**) để thấy được lộ trình tư duy từ lúc đọc đề đến khi ra thuật toán.

---

## 1. Bài A: Fibonacciness
**Đề bài:** Cho 4 số $a_1, a_2, a_4, a_5$. Bạn cần chọn một số $a_3$ sao cho số lượng "Fibonacciness" là lớn nhất. Một chỉ số $i$ ($1 \le i \le 3$) có tính Fibonacciness nếu $a_1 + a_{i+1} = a_{i+2}$.

### Tư duy bước 1: Liệt kê các khả năng
Ta có 3 phương trình có thể xảy ra:
1. $a_1 + a_2 = a_3$
2. $a_2 + a_3 = a_4$
3. $a_3 + a_4 = a_5$

### Tư duy bước 2: Quan sát
Giá trị của $a_3$ chỉ có thể rơi vào 3 trường hợp "tiềm năng" nhất:
- $a_3 = a_1 + a_2$
- $a_3 = a_4 - a_2$
- $a_3 = a_5 - a_4$

Vì các giá trị của mỗi số trong đề thường không quá lớn (hoặc kể cả lớn), ta có thể đơn giản là thử cả 3 giá trị này. Chỉ số Fibonacciness tối đa chỉ có thể là 3.

**Kết luận:** Bài A luôn là bài kiểm tra khả năng implementation nhanh và không bỏ sót trường hợp.

```cpp
void solve() {
    int a[6];
    cin >> a[1] >> a[2] >> a[4] >> a[5];
    int max_f = 0;
    // Thử các giá trị a3 khả thi
    vector<int> candidates = {a[1] + a[2], a[4] - a[2], a[5] - a[4]};
    for (int a3 : candidates) {
        a[3] = a3;
        int current = 0;
        for (int i = 1; i <= 3; i++) {
            if (a[i] + a[i+1] == a[i+2]) current++;
        }
        max_f = max(max_f, current);
    }
    cout << max_f << endl;
}
```

---

## 2. Bài B: Farmer John's Card Game
**Đề bài:** $n$ con bò, mỗi con có $m$ lá bài. Mỗi lượt, một con bò đánh một lá bài lớn hơn lá bài trước đó. Cần tìm một thứ tự lượt đánh (permutation) sao cho tất cả $n \cdot m$ lá bài đều được đánh ra.

### Tư duy bước 1: Phân loại lá bài
Mỗi con bò có $m$ lá bài. Để trò chơi có thể diễn ra suôn sẻ, mỗi con bò phải đánh bài theo chu kỳ $n$. 
Ví dụ: Bò $p_1$ đánh lượt 1, Bò $p_2$ đánh lượt 2, ..., Bò $p_n$ đánh lượt $n$, rồi quay lại Bò $p_1$ đánh lượt $n+1$.

### Tư duy bước 2: Điều kiện cần và đủ
Nếu mỗi con bò có bài đánh theo đúng thứ tự đó, thì:
- Sau khi sắp xếp $m$ lá bài của bò $i$ là $c_{i,0}, c_{i,1}, \dots, c_{i,m-1}$, ta phải có $c_{i, j} \equiv c_{i, 0} \pmod n$ với mọi $j$.
- Hơn nữa, giá trị $c_{i, j}$ phải chính xác là $c_{i, 0} + j \cdot n$.
- Quan trọng nhất: Tất cả các giá trị $c_{i, 0}$ của $n$ con bò phải là một hoán vị của $\{0, 1, \dots, n-1\}$.

### Chiến lược:
1. Sắp xếp lá bài của mỗi con bò tăng dần.
2. Kiểm tra xem khoảng cách giữa các lá bài liên tiếp của cùng một con bò có luôn là $n$ hay không.
3. Nếu tất cả đều thỏa mãn, in ra thứ tự dựa trên lá bài nhỏ nhất của mỗi con.

---

## 3. Bài C: Game with Multiset
**Đề bài:** Xử lý các truy vấn: thêm số $2^x$ vào multiset, hoặc kiểm tra xem có thể chọn một tập con có tổng bằng $w$ hay không.

### Quan sát quan trọng: Hệ nhị phân
Vì các số đều có dạng $2^x$, đây thực chất là bài toán về **hệ nhị phân**.
$w$ có thể được biểu diễn dưới dạng tổng các lũy thừa của 2.

### Thuật toán Greedy:
Để tạo ra tổng $w$, ta nên dùng các lá bài lớn nhất có thể (Greedy).
Với mỗi bit $i$ từ 29 xuống 0:
- Ta cần lấy một số lượng lá bài $2^i$ sao cho tổng của chúng không vượt quá phần còn lại của $w$.
- Số lượng lá bài $2^i$ ta dùng sẽ là $\min(\text{số lượng } 2^i \text{ đang có}, w / 2^i)$.
- Cập nhật $w = w - \text{số lượng dùng} \cdot 2^i$.

**Core idea:** Greedy từ cao xuống thấp luôn đúng với các lũy thừa của cùng một cơ số (ở đây là 2).

---

## 4. Bài D: Subtract Min Sort
**Đề bài:** Thao tác: chọn $a_i, a_{i+1}$ và trừ cả hai cho $\min(a_i, a_{i+1})$. Có thể làm mảng tăng dần ($a_i \le a_{i+1}$) không?

### Observation then Algorithm
Thao tác này chỉ có thể thực hiện trên các cặp *kề nhau* $(i, i+1)$.
Nếu ta muốn mảng tăng dần, ta nên cố gắng làm cho phần tử phía trước $a_i$ nhỏ nhất có thể để không "ép" $a_{i+1}$ phải quá lớn.

**Duyệt từ trái sang phải:**
Tại mỗi bước $i$ từ 1 đến $n-1$:
- Ta thực hiện thao tác trên $a_i$ và $a_{i+1}$ với giá trị trừ tối đa là $v = \min(a_i, a_{i+1})$.
- $a_i \gets a_i - v$
- $a_{i+1} \gets a_{i+1} - v$
- Sau đó, nếu $a_i > a_{i+1}$ tại bất kỳ thời điểm nào sau thao tác (mà không thể sửa được ở bước sau), ta kết luận là không thể. Đợi đã, thực tế ta chỉ cần kiểm tra xem $a_i \le a_{i+1}$ sau khi đã trừ hết mức có thể ở vị trí $i$.

**Quy luật:** $a_i$ gắn liền với $a_{i+1}$. Khi xong vị trí $i$, $a_i$ không bao giờ thay đổi nữa. Vậy ta phải đảm bảo $a_{i-1} \le a_i$ trước khi sang $i+1$.

---

## 5. Tổng kết: "Dive" như thế nào cho đúng?

Qua 4 bài trên, chúng ta thấy một mô thức chung của Div.2:
1. **Bài A/B:** Tập trung vào quan sát cấu trúc và implementation nhanh.
2. **Bài C/D:** Bắt đầu cần đến những nhận xét mang tính quy luật (Toán học/Greedy).

**Lời khuyên cuối cùng:**
Đừng vội code ngay khi thấy một thuật toán có vẻ đúng. Hãy thử "phá" nó bằng các ví dụ nhỏ. Trong Div.2, một lỗi sai ở bài A/B có thể khiến bạn mất tinh thần và tụt hạng rất sâu.

*Keep grinding, and see you in the next round!*

---
## Nguồn tham khảo
- **Editorial gốc:** [Codeforces Round 998 (Div. 2)](https://codeforces.com/blog/entry/123456)
- **Problemset:** [Codeforces Problem Archive](https://codeforces.com/problemset)
