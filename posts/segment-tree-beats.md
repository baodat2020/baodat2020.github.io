---
title: "Kỹ thuật Segment Tree Beats"
date: "2024-03-12"
excerpt: "Segment Tree Beats (Nhịp đập Cây Phân Đoạn) là kỹ thuật giải quyết các phép biến đổi range chmin/chmax..."
readTime: "12 phút"
tag: "algo"
---

# Kỹ thuật Segment Tree Beats

Segment Tree Beats (được đặt tên bởi *jiry_2*, đôi khi được gọi là Ji-Driver Tree ở OI Wiki) là một kỹ thuật mở rộng của Cây phân đoạn (Segment Tree), cho phép chúng ta thực thi các truy vấn thay đổi dãy số rất mạnh mà Segment Tree cơ bản (có Lazy Propagation thông thường) không thể giải quyết được. Điển hình như các dạng truy vấn **Range `chmin`** và **Range `chmax`**.

## Bài toán cơ bản

Cho mảng $a$ gồm $N$ phần tử, hỗ trợ hai cập nhật/truy vấn:
1. `Update(L, R, x)`: Với mọi $i \in [L, R]$, lấy $a_i = \min(a_i, x)$ (gọi tắt là **chmin**).
2. `Query(L, R)`: Tính tổng các $a_i$ với $i \in [L, R]$.

Nếu chúng ta chỉ duy trì tổng (sum), thao tác `chmin` dường như không thể chạy với Lazy Propagation, vì nếu có nhiều giá trị khác nhau trong khoảng $[L, R]$, ta không biết bao nhiêu giá trị thực sự thay đổi và thay đổi đi bao nhiêu. Đằng sau bài toán $\min(x, \cdot)$ này, Segment Tree Beats đưa ra một góc nhìn mới về độ phức tạp.

## Ý tưởng cốt lõi

Thay vì chỉ lưu `sum` trên một nút của Segment Tree, chúng ta lưu:
- `sum`: Tổng các phần tử.
- `max_val`: Giá trị lớn nhất trong đoạn.
- `max_cnt`: Số lần xuất hiện của giá trị lớn nhất.
- `second_max`: Giá trị lớn **thứ hai** trong đoạn (lớn nhất tiếp theo, nhưng thực sự nhỏ hơn `max_val`).

Khi xử lý truy vấn thay đổi mảng $a_i \gets \min(a_i, x)$ trên một node ứng với đoạn $[L, R]$, hàm đệ quy của ta sẽ dựa trên 3 tình huống (dựa vào [USACO Guide](https://usaco.guide/adv/segment-tree-beats?lang=cpp)):

1. **Break condition (Trường hợp dừng):**
   Nếu `max_val <= x`, không có giá trị nào trong đoạn này bị thay đổi. Lập tức **return**.

2. **Tag condition (Trường hợp đánh dấu):**
   Nếu `second_max < x < max_val`, lúc này **chỉ có** những phần tử mang giá trị `max_val` mới bị ảnh hưởng bởi $x$. Tất cả những phần tử mang giá trị lớn nhất đó sẽ biến thành $x$.
   Lúc này ta cập nhật `sum -= (max_val - x) * max_cnt`, và đánh dấu `lazy` tag cho con, thay đổi `max_val = x`. Sau đó dừng đệ quy.

3. **Explore condition (Trường hợp tiếp tục duyệt sâu):**
   Nếu `x <= second_max`, lúc này không chỉ `max_val` mà cả `second_max` (và có thể nhiều hơn) cũng bị biến thành $x$. Cấu trúc bên dưới bị phá vỡ phức tạp. Ta **không** áp dụng Lazy tag ngay mà gọi đệ quy tiếp tục chui xuống hai cây con trái phải.

## Mã giả C++ (cập nhật `chmin`)

```cpp
void modify(int node, int l, int r, int ql, int qr, int x) {
    if (l > qr || r < ql || tree[node].max_val <= x) {
        return; // Break condition
    }

    if (ql <= l && r <= qr && tree[node].second_max < x) {
        // Tag condition
        apply(node, x);
        return;
    }

    // Explore condition (push down và đệ quy)
    push_down(node, l, r);
    int mid = (l + r) >> 1;
    modify(node << 1, l, mid, ql, qr, x);
    modify(node << 1 | 1, mid + 1, r, ql, qr, x);
    pull_up(node); // Cập nhật lại max_val, max_cnt, second_max, sum
}
```

## Độ phức tạp

Toán học đằng sau kỹ thuật này, hay phương pháp thế năng (Potential Method) và amortized analysis chứng minh rằng số lượng "trường hợp duyệt sâu" là không quá nhiều. Độ phức tạp khấu hao cho mỗi thao tác là $\mathcal{O}(\log N)$. 

Kỹ thuật Segment Tree Beats có thể mở rộng với các truy vấn `chmax`, cập nhật `add(x)` hay tính lịch sử (historical information). Đây là một tool mạnh mẽ đem lại nhiều kinh nghiệm cho người tham gia code thi đấu.
