---
title: "Kỹ thuật Segment Tree Beats"
date: "2024-03-12"
excerpt: "Segment Tree Beats (Nhịp đập Cây Phân Đoạn) là kỹ thuật giải quyết các phép biến đổi range chmin/chmax..."
readTime: "25 phút"
tag: "algo"
image: "assets/thumbnail_segment.png"
---

# Kỹ thuật Segment Tree Beats

**Segment Tree Beats** (được thế giới CP biết đến qua *jiry_2*, đôi khi được gọi là **Ji-Driver Tree**) là một sự mở rộng kinh ngạc của Cây phân đoạn (Segment Tree). Nó được thiết kế để xử lý các truy vấn biến đổi đặc biệt khó nhằn mà một Segment Tree thông thường với Lazy Propagation có thể phải "bó tay", cụ thể là truy vấn thay đổi kiểu **Range `chmin`** và **Range `chmax`**.

*Nội dung bài viết này được biên dịch và tổng hợp từ bài viết huyền thoại [Codeforces Blog 57319](https://codeforces.com/blog/entry/57319) của tác giả `jiry_2` và `jcvb`.*

## 1. Bài toán mở đầu: Cập nhật Range Min & Truy vấn Range Sum

Cho một mảng $A$ gồm $N$ phần tử. Cần hỗ trợ 2 loại truy vấn:
1. `Update(L, R, x)`: Với mọi $i \in [L, R]$, gán $A_i = \min(A_i, x)$ (gọi tắt là **chmin**).
2. `Query(L, R)`: Tính $\sum_{i=L}^{R} A_i$ (tổng các phần tử trong đoạn).

Để giải quyết bài toán này, mỗi nút trên Segment Tree không chỉ lưu trạng thái `sum` mà còn cần lưu trữ thêm các thông tin sau để "đón đầu" thao tác `chmin`:
- `sum`: Tổng các phần tử.
- `max_val`: Giá trị LỚN NHẤT trong đoạn $\max_{i=l}^{r} A_i$.
- `max_cnt`: Số phần tử nhận giá trị `max_val` trong đoạn.
- `second_max`: Giá trị LỚN THỨ HAI trong đoạn (lớn nhất nghiêm ngặt tiếp theo, tức là $\max \{ A_i \mid A_i < \text{max\_val} \}$ ).

### Phân tích thuật toán: 3 Điều kiện Dừng

Khi xử lý truy vấn $A_i \gets \min(A_i, x)$ trên một node, hàm đệ quy của ta sẽ điều phối qua 3 tình huống (điều kiện) cốt lõi sau:

1. **Break Condition (Dừng Khám Phá):** Nếu $max\_val \le x$.
   Trong trường hợp này, việc gán $\min(A_i, x)$ không làm thay đổi bất kỳ phần tử nào trong đoạn quản lý hiện tại. Ta `return` ngay lập tức.
   
2. **Tag Condition (Đánh Dấu Lười Biếng):** Nếu $second\_max < x < max\_val$.
   Lúc này, **chỉ có duy nhất** nhóm các phần tử đang giữ vị trí quán quân `max_val` mới bị ép xuống $x$. Còn những phần tử có giá trị nhỏ hơn hoặc bằng `second_max` thì vẫn an toàn $A_i \le second\_max < x$. 
   Vì đã biết có đúng `max_cnt` phần tử đang có giá trị `max_val`, ta hoàn toàn tính ra được sự thay đổi của tổng:
   $$ sum = sum - (max\_val - x) \cdot max\_cnt $$
   Ta cập nhật lại `max_val = x`, gán một nhãn `lazy` xuống và `return` (không cần đi sâu thêm vào cây con).

3. **Explore Condition (Đệ quy tiếp tục):** Nếu $x \le second\_max$.
   Tình huống này có nghĩa là ngoài những phần tử lớn nhất `max_val`, cả những phần tử `second_max` (và có thể nhỏ hơn nữa) cũng bị ảnh hưởng bởi phép ép $\min$. Ta không thể đoán được có bao nhiêu phần tử bị biến đổi. Khắc phục duy nhất là: **Đẩy đệ quy (Exploration) xuống 2 cây con**!

### Cài đặt (C++ Code)

```cpp
void modify(int node, int l, int r, int ql, int qr, int x) {
    if (l > qr || r < ql || tree[node].max_val <= x) return; // Break Condition
    if (ql <= l && r <= qr && tree[node].second_max < x) {    // Tag Condition
        apply(node, x); // Cập nhật sum và max_val
        return;
    }
    // Explore Condition
    push_down(node);
    int mid = (l + r) / 2;
    modify(node * 2, l, mid, ql, qr, x);
    modify(node * 2 + 1, mid + 1, r, ql, qr, x);
    pull_up(node);
}
```

## 2. Chứng minh độ phức tạp $\mathcal{O}(N \log N)$

Một cái nhìn trực quan có thể khiến ta ái ngại: Việc "Tình huống 3" đẩy đệ quy đâm thẳng xuống các lá trông như có thể thoái hóa về độ phức tạp $\mathcal{O}(N)$ cho mỗi truy vấn, liệu thuật toán này có bị Time Limit Exceeded (TLE)?

Câu trả lời là **KHÔNG**. Bằng **phép phân tích khấu hao (Amortized Analysis)** với Phương pháp Thế năng (Potential Method), chúng ta có thể chứng minh cận trên an toàn tuyệt đối.

*Mô phỏng hình ảnh minh hoạ một thao tác đẩy Tag Condition cắt ngang qua các node:*
![Segment Tree Beats Transformation](https://espresso.codeforces.com/1523fe71b9dbdf87a2027b165243adbf692fada5.png)

Hãy định nghĩa một khái niệm: **Tag class** của một nút (node) $u$ trên cây là tập hợp các số lớn nhất (max values) của tất cả các phần tử thuộc cây con gốc $u$. Ta thấy rằng chỉ có không quá $\log N$ nút dọc theo đường đi từ gốc xuống lá thay đổi. 

Cụ thể, định nghĩa thế năng $\Phi$ là tổng số các giá trị phân biệt trong một đoạn. 
Mỗi lần thao tác `modify` rơi vào **Tình huống 3 (Explore Condition)** xảy ra ở một Node, thao tác tiếp theo chắc chắn sẽ gộp 2 giá trị $\max$ và á quân lại thành 1 (vì $x \le second\_max$). Điều này đồng nghĩa với việc số lượng các giá trị riêng biệt (distinct values) trên toàn bộ mảng bị **giảm đi ít nhất 1**.
Mỗi thao tác Interval Query ban đầu trên Segment tree làm tăng số distinct value lên tối đa $\mathcal{O}(\log N)$. 

Do đó, tổng số lần rơi vào trường hợp đệ quy Explore bị chặn bởi sự tăng của "lượng distinct values" tạo ra từ mỗi Query. Vậy tổng thời gian khám phá trên toàn bảng trong $Q$ truy vấn bị chặn chặt ở mốc **$\mathcal{O}((N + Q) \log N)$**.

## 3. Mở rộng: Nâng cấp với Query Add $A_i \gets A_i + x$

Thuật toán càng trở nên thú vị hơn nếu bài toán của chúng ta cho phép thêm loại truy vấn **cộng bù** vào mảng.
`Update_Add(L, R, x)`: Với mọi $i \in [L, R]$, gán $A_i = A_i + x$.

Bài toán này nổi tiếng với tên gọi [HDU 5306 - Gorge's Array](https://acm.hdu.edu.cn/showproblem.php?pid=5306). Khi có thêm Query `Add`, cây cần thêm nhãn `lazy_add` quản lý phép cộng, đồng thời cập nhật cả `max_val`, `second_max` và `sum` tương ứng khi đẩy `lazy` xuống. Dù phức tạp hơn đôi chút nhưng cấu trúc 3 Break/Tag/Explore Rules vẫn đứng vững, và độ phức tạp khấu hao lúc này được chứng minh là **$\mathcal{O}((N + Q) \log^2 N)$**.

## 4. Tài nguyên luyện tập

Thuật toán mạnh mẽ này đã có vô số tài liệu luyện tập và bài toán tuyệt hay trên mạng. Sau khi nắm vững lý thuyết, hãy vác code đến ngay những sới đấu sau:
- [Codeforces 438D - The Child and Sequence](https://codeforces.com/problemset/problem/438/D): Dùng kỹ thuật Range Modulo (biến thể rất giống ST Beats, dùng break point là số chia Modulo). 
- **BZOJ 4695: Đỉnh cao nhất của ST Beats** kết hợp mọi thao tác.
- [Codeforces 1290E - Cartesian Tree](https://codeforces.com/problemset/problem/1290/E): Một bài Hard Level 3000+ Div 1 áp dụng ST Beats để quản lý Parent trên Cartesian Tree. Nó cho thấy sức mạnh bá đạo của ji_driver.

Chúc thạo kỹ thuật đáng sợ nhưng đầy ảo diệu này!
