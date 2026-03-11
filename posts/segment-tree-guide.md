# Segment Tree từ cơ bản đến nâng cao

Segment Tree là một trong những **cấu trúc dữ liệu** quan trọng nhất trong Competitive Programming. Bài viết này sẽ đưa bạn từ khái niệm cơ bản đến các ứng dụng nâng cao.

## Segment Tree là gì?

Segment Tree là một cây nhị phân hoàn chỉnh được xây dựng trên một mảng, cho phép:

- **Range Query** — truy vấn trên đoạn [l, r] trong O(log n)
- **Point Update** — cập nhật phần tử tại vị trí i trong O(log n)

### Xây dựng cơ bản

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
int tree[4 * MAXN], a[MAXN];
int n;

void build(int node, int l, int r) {
    if (l == r) {
        tree[node] = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build(2 * node, l, mid);
    build(2 * node + 1, mid + 1, r);
    tree[node] = tree[2 * node] + tree[2 * node + 1]; // sum segment tree
}

int query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return tree[node];
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr)
         + query(2 * node + 1, mid + 1, r, ql, qr);
}

void update(int node, int l, int r, int pos, int val) {
    if (l == r) {
        tree[node] = val;
        return;
    }
    int mid = (l + r) / 2;
    if (pos <= mid) update(2 * node, l, mid, pos, val);
    else update(2 * node + 1, mid + 1, r, pos, val);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}
```

## Lazy Propagation

Khi bạn cần **Range Update** (cập nhật cả đoạn [l, r]), thì Point Update sẽ không đủ. Đây là lúc ta cần **Lazy Propagation**.

Ý tưởng: "trì hoãn" việc cập nhật — chỉ cập nhật node khi cần thiết, đánh dấu `lazy` để nhớ phải cập nhật sau.

```cpp
int lazy[4 * MAXN];

void pushDown(int node, int l, int r) {
    if (lazy[node] == 0) return;
    int mid = (l + r) / 2;
    tree[2 * node] += lazy[node] * (mid - l + 1);
    lazy[2 * node] += lazy[node];
    tree[2 * node + 1] += lazy[node] * (r - mid);
    lazy[2 * node + 1] += lazy[node];
    lazy[node] = 0;
}

void updateRange(int node, int l, int r, int ql, int qr, int val) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) {
        tree[node] += val * (r - l + 1);
        lazy[node] += val;
        return;
    }
    pushDown(node, l, r);
    int mid = (l + r) / 2;
    updateRange(2 * node, l, mid, ql, qr, val);
    updateRange(2 * node + 1, mid + 1, r, ql, qr, val);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}
```

## Khi nào dùng Segment Tree?

| Bài toán | Cấu trúc phù hợp |
|----------|-----------------|
| Range Sum, Range Min/Max | Segment Tree |
| Range Update + Range Query | Segment Tree + Lazy |
| Dynamic Range | Segment Tree động |
| 2D range queries | 2D Segment Tree / BIT 2D |

## Kết luận

Segment Tree là nền tảng cho rất nhiều bài toán nâng cao hơn như **Persistent Segment Tree**, **Merge Sort Tree**, hay **Segment Tree Beats**. Hãy nắm vững phần cơ bản trước!

Happy coding! 🎯
