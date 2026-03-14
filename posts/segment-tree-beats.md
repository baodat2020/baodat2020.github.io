---
title: "Kỹ thuật Segment Tree Beats"
date: "2024-03-12"
excerpt: "Segment Tree Beats (Nhịp đập Cây Phân Đoạn) là kỹ thuật giải quyết các phép biến đổi range chmin/chmax..."
readTime: "20 phút"
tag: "algo"
image: "assets/thumbnail_segment.png"
---

# Kỹ thuật Segment Tree Beats

**Segment Tree Beats** (được thế giới CP biết đến qua *jiry_2*, đôi khi được gọi là **Ji-Driver Tree**) là một sự mở rộng kinh ngạc của Cây phân đoạn (Segment Tree). Nó được thiết kế để xử lý các truy vấn biến đổi đặc biệt khó nhằn mà một Segment Tree thông thường với Lazy Propagation có thể phải "bó tay", cụ thể là truy vấn thay đổi kiểu **Range `chmin`** và **Range `chmax`**.

## 1. Bài toán: Khi Lazy Propagation sụp đổ

Một bài toán điển hình kích hoạt Segment Tree Beats:
Cho một mảng $A$ gồm $N$ phần tử. Cần hỗ trợ 2 loại truy vấn:
1. `Update(L, R, x)`: Với mọi $i \in [L, R]$, lấy $A_i = \min(A_i, x)$ (gọi tắt là **chmin**).
2. `Query(L, R)`: Tính tổng các $A_i$ với $i \in [L, R]$.

Bình thường khi cộng một đoạn `(add(L, R, x))`, tổng đoạn đó tăng thêm `x * (R - L + 1)`. 
Nhưng với truy vấn `chmin`, nếu ta đang quản lý một nút và biết tổng của nó, ta **chẳng thể biết được** phần tử nào bên trong đang lớn hơn $x$ và lớn hơn bao nhiêu để có thể trừ đi tổng số hợp lý. Các phần tử bị tác động ngẫu nhiên khiến Lazy Tree hoàn toàn không áp dụng được!

## 2. Kỹ thuật "Khám phá"

Ji-Driver đề xuất việc lưu trữ sâu hơn trạng thái của từng đoạn trên Segment Tree. Tại một nút quản lý đoạn, ta lưu lại:
- `sum`: Tổng các phần tử.
- `max_val`: Giá trị LỚN NHẤT trong đoạn.
- `max_cnt`: Số phần tử nhận giá trị `max_val` trong đoạn.
- `second_max`: Giá trị LỚN THỨ HAI trong đoạn (lớn nhất nghiêm ngặt tiếp theo, tức là $\max \{ A_i \mid A_i < \text{max\_val} \}$ ).

Khi xử lý truy vấn $A_i \gets \min(A_i, x)$ trên một node, hàm đệ quy của ta sẽ điều phối qua 3 tình huống cốt lõi sau:

### Tình huống 1: Break Condition (Dừng Khám Phá)
Nếu giá trị lớn nhất trong đoạn đã nhỏ hơn hoặc bằng $x$ (`max_val <= x`).
*Xử lý:* Đoạn này chẳng có thần dân nào bị ảnh hưởng bởi lời nguyền $\min(A, x)$ cả. Ta `return` ngay lập tức!

### Tình huống 2: Tag Condition (Đánh Dấu Lười Biếng)
Nếu giá trị lớn thứ 2 nằm dưới ngưỡng $x$, còn giá trị lớn nhất thì chọc thủng $x$ ($second\_max < x < max\_val$).
*Xử lý:* Lúc này, **chỉ có duy nhất** nhóm các phần tử đang giữ vị trí quán quân `max_val` mới bị ép xuống $x$. Những phần tử còn lại hoàn toàn an toàn. 
Vì đã biết có đúng `max_cnt` phần tử thủ lĩnh đang mang giá rẻ `max_val`, ta hoàn toàn tính ra được lượng thâm hụt:
$$ sum = sum - (max\_val - x) \cdot max\_cnt $$
Ta cập nhật `max_val = x`, tag `lazy` xuống và `return` (không đi sâu thêm).

### Tình huống 3: Explore Condition (Chia ra Trị)
Tình huống tồi tệ nhất ($x \le second\_max$).
Lúc này cả bọn quán quân, á quân, và không biết bao nhiêu phần tử khác cũng bị ép xuống $x$. Ta không thể đoán được.
*Xử lý:* **Đẩy đệ quy (Exploration) xuống 2 cây con**!

```cpp
void modify(int node, int l, int r, int ql, int qr, int x) {
    if (l > qr || r < ql || tree[node].max_val <= x) return; // Break 
    if (ql <= l && r <= qr && tree[node].second_max < x) {    // Tag
        apply(node, x); return;
    }
    // Explore
    push_down(node);
    int mid = (l + r) / 2;
    modify(node * 2, l, mid, ql, qr, x);
    modify(node * 2 + 1, mid + 1, r, ql, qr, x);
    pull_up(node);
}
```

## 3. Chứng minh thời gian O(N log^2 N)

Việc "Tình huống 3" đẩy đệ quy xuống các lá trông như có thể thoái hóa về độ phức tạp $\mathcal{O}(N)$ cho mỗi truy vấn nếu đồ thị cấu trúc phức tạp, nhưng nhờ vào **phép phân tích khấu hao (Amortized Analysis)** qua Phương pháp Thế năng, nhà toán học đã chứng minh thuật toán này có cận trên cực kỳ an toàn. 

Đơn giản hóa: Hãy coi mỗi lần một "giá trị riêng biệt" bị ép lún bằng với một giá trị khác (hai loại số trập làm một), số lượng các "loại số" sẽ giảm đi. Mỗi nút tốn cost khám phá khi và chỉ khi số lượng distinct values tại nút đó giảm. Vì số loại chỉ tăng qua các nhát cắt Interval của Truy vấn Segment Tree $\mathcal{O}(\log N)$, tổng thời gian "Explore" trên toàn bảng trong $Q$ truy vấn bị chặn chặt ở mốc $\mathcal{O}((N + Q) \log N)$ đối với update thuần chay, hoặc $\mathcal{O}((N+Q) \log^2 N)$ với thêm tính năng `add`.

## 4. Tài nguyên luyện tập

Thuật toán mạnh mẽ này đã có vô số tài liệu luyện tập và bài toán tuyệt hay trên mạng:
- [Codeforces Blog 57319: Segment tree beats guide](https://codeforces.com/blog/entry/57319) – Tài liệu được coi là ngọn cờ đầu trong làng ST Beats.
- **HDU 5306 Gorge's Array:** Bài toán kinh điển nhất của Segment Tree Beats, yêu cầu đúng chuẩn chẩn query Range chmin, Sum, Max. 
- **Codeforces 438D - The Child and Sequence:** Dùng kỹ thuật Range Modulo (biến thể khá giống ST Beat, modulo chia đôi thay vì thao tác trên max_val). 
- **Codeforces 1290E - Cartesian Tree:** Một bài Hard Level 3000+ Div 1 áp dụng ST Beats để quản lý Parent trên Cartesian Tree. Nó cho thấy sức mạnh của ji_driver. [Tham khảo trên Codeforces](https://codeforces.com/problemset/problem/1290/E). Mời các bạn thử sức!
