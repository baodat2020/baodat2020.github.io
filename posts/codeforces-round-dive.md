# Phân tích Div.2 — Tư duy giải toán từng bước

Trong bài viết này, mình sẽ walk-through cách mình tiếp cận một contest Codeforces Div.2 điển hình — từ lúc đọc đề đến lúc submit AC.

## Chiến lược chung của mình

Khi bắt đầu một contest Div.2:

1. **Đọc lướt tất cả đề** trong 5 phút đầu — nắm sơ constraint
2. **Bắt tay từ A → B → C** theo thứ tự
3. **Bài D/E**: suy nghĩ kỹ trước khi code, tránh code sai nhiều lần

> "Think twice, code once."

## Bài A — Implementation / Greedy đơn giản

Bài A thường là implement thẳng theo đề, hoặc greedy đơn giản. Điều quan trọng:

- Đọc kỹ edge case
- Test ngay trên example
- Submit sớm, không overthink

**Tip**: Nếu đề có n ≤ 1000, cứ dùng O(n²) thoải mái.

## Bài B — Observation

Bài B thường cần một **observation** — nhận ra tính chất toán học hoặc cấu trúc bài.

```cpp
// Ví dụ: Bài toán tìm phần tử ≠ XOR của cả mảng
int solve() {
    int n; cin >> n;
    vector<int> a(n);
    int xorAll = 0;
    for (auto& x : a) { cin >> x; xorAll ^= x; }
    
    // Nếu xorAll == 0, mọi phần tử đều "match"
    // Tìm phần tử đặc biệt...
    return 0;
}
```

## Bài C — DP / Graph / Binary Search

Bài C là ranh giới giữa "dễ" và "khó" trong Div.2. Thường gặp:

- **DP đơn giản** — dp[i] = trạng thái tốt nhất với i phần tử đầu
- **Binary Search on Answer** — kiểm tra xem mid có thỏa mãn không
- **Graph BFS/DFS** — tìm shortest path hoặc connectivity

### Template Binary Search

```cpp
auto check = [&](long long mid) -> bool {
    // return true nếu mid thỏa mãn điều kiện
    return /* ... */;
};

long long lo = 0, hi = 1e18;
while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (check(mid)) hi = mid;
    else lo = mid + 1;
}
// lo là đáp án nhỏ nhất thỏa mãn
```

## Những lỗi thường gặp

| Lỗi | Nguyên nhân | Phòng tránh |
|-----|-------------|-------------|
| Wrong Answer | Sai edge case | Test thủ công |
| Time Limit | Complexity sai | Estimate trước |
| Runtime Error | Out of bounds | Kiểm tra index |
| Overflow | int × int → long long | Dùng `1LL *` |

## Kết luận

CP không phải là ghi nhớ nhiều thuật toán — mà là **rèn luyện tư duy**. Mỗi contest là một cơ hội để nhìn nhận xem mình đang yếu ở đâu và cải thiện.

Keep grinding! 💪
