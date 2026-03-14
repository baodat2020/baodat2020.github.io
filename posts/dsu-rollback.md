---
title: "Disjoint Set Union (DSU) với Rollback"
date: "2024-03-14"
excerpt: "Kỹ thuật Rollback giúp DSU giải quyết các bài toán có truy vấn xóa hoặc quản lý các trạng thái trên cây..."
readTime: "8 phút"
tag: "algo"
---

# Disjoint Set Union (DSU) với Rollback

Cấu trúc dữ liệu **Disjoint Set Union (DSU)** là một công cụ mạnh mẽ và phổ biến trong Lập trình thi đấu để quản lý các tập hợp rời rạc. Tuy nhiên, DSU cơ bản chỉ hỗ trợ thao tác *thêm* (hợp nhất hai tập hợp). Trong nhiều bài toán, chúng ta cần phải *xóa* cạnh hoặc khôi phục lại trạng thái cũ của DSU. Đây là lúc kỹ thuật **DSU có Rollback** phát huy tác dụng.

## Ý tưởng cốt lõi

Thay vì sử dụng Path Compression (nén đường) — kỹ thuật làm thay đổi cấu trúc cây một cách quy mô và khó hoàn tác — chúng ta sẽ chỉ sử dụng **Union by Size** hoặc **Union by Rank**. Như vậy, độ sâu lớn nhất của cây vẫn được đảm bảo là $\mathcal{O}(\log N)$, dẫn đến thao tác `find` mất thời gian $\mathcal{O}(\log N)$.

Để có thể rollback (hoàn tác) thao tác `union`, chúng ta cần lưu trữ tất cả những thay đổi đã diễn ra:
- Định danh của đỉnh gốc bị thay đổi cha (`v`).
- Giá trị trước đó của mảng `parent[v]` (hoặc `size[u]`).

## Cài đặt (C++17)

Dưới đây là một template DSU with Rollback chuẩn bằng C++ dựa trên các tài liệu từ [OI Wiki](https://oi-wiki.org/ds/dsu/#%E5%8F%AF%E6%92%A4%E9%94%80%E5%B9%B6%E6%9F%A5%E9%9B%86):

```cpp
struct RollbackDSU {
    vector<int> p, sz;
    vector<pair<int*, int>> history;

    RollbackDSU(int n) {
        p.resize(n + 1);
        iota(p.begin(), p.end(), 0);
        sz.assign(n + 1, 1);
    }

    int find(int x) {
        return x == p[x] ? x : find(p[x]); // KHÔNG dùng Path Compression
    }

    bool unite(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) return false;
        
        if (sz[u] < sz[v]) swap(u, v);
        
        // Lưu trữ lại lịch sử trước khi thay đổi
        history.push_back({&p[v], p[v]});
        history.push_back({&sz[u], sz[u]});
        
        p[v] = u;
        sz[u] += sz[v];
        return true;
    }

    // Lấy thời điểm hiện tại
    int time() const {
        return history.size();
    }

    // Khôi phục về thời điểm t
    void rollback(int t) {
        while (history.size() > t) {
            *history.back().first = history.back().second;
            history.pop_back();
        }
    }
};
```

## Ứng dụng: Duyệt đồ thị theo sự kiện (Offline Dynamic Connectivity)

Kỹ thuật điển hình nhất sử dụng DSU Rollback là thuật toán **Chia để trị theo thời gian** (Divide and Conquer on Time). 
Với đồ thị mà các cạnh xuất hiện và biến mất tại các thời điểm khác nhau, chúng ta có thể xây dựng một Segment Tree trên trục thời gian. 
Tại mỗi nút của Segment Tree, chúng ta `unite` các cạnh có mặt trong khoảng thời gian đó, gọi đệ quy chui xuống các nút con, và sau đó gọi `rollback` khi quay lui lên. Điều này cho phép chúng ta trả lời các truy vấn kết nối / đếm số thành phần liên thông trong đồ thị động một cách hiệu quả với độ phức tạp $\mathcal{O}(Q \log Q \log N)$.

Hiểu sâu về Rollback DSU sẽ là bước ngoặt quan trọng giúp bạn tackle các bài toán khó trên Codeforces từ tầm Div. 1!
