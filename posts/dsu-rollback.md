---
title: "Disjoint Set Union (DSU) với Rollback"
date: "2026-03-14"
excerpt: "Kỹ thuật Rollback giúp DSU giải quyết các bài toán có truy vấn xóa hoặc quản lý các trạng thái trên cây qua Offline Dynamic Connectivity..."
readTime: "15 phút"
tag: "algo"
image: "assets/thumbnail_dsu.png"
---

# Disjoint Set Union (DSU) với Rollback

Cấu trúc dữ liệu **Disjoint Set Union (DSU)** là một công cụ cực kỳ phổ biến trong Lập trình thi đấu để quản lý các tập hợp rời rạc và đồ thị. Tuy nhiên, DSU cơ bản chỉ hỗ trợ thao tác *thêm* (hợp nhất hai tập hợp). Trong rất nhiều bài toán, chúng ta cần phải *xóa* cạnh hoặc khôi phục lại trạng thái cũ của đồ thị. Kỹ thuật **DSU có Rollback** ra đời để giải quyết triệt để yêu cầu này.

## 1. Vấn đề của DSU truyền thống
Trong một DSU thông thường, để đạt độ phức tạp khấu hao (amortized) rất nhỏ $\mathcal{O}(\alpha(N))$, ta kết hợp 2 kỹ thuật:
1. **Union by Size (hoặc Rank):** Luôn gán gốc của cây nhỏ hơn vào gốc của cây lớn hơn.
2. **Path Compression (Nén đường):** Khi gọi `find(u)`, ta trỏ trực tiếp $u$ và tất cả các nút trên đường đi từ $u$ lên gốc của nó.

Nếu chúng ta muốn "hoàn tác" (rollback) một thao tác `union`, thao tác nén đường trở thành "cơn ác mộng" vì nó xáo trộn cấu trúc cây ở quy mô lớn. Việc lưu lại mọi `parent` bị thay đổi do nén đường tốn kém cả về thời gian và bộ nhớ.

## 2. Kỹ thuật DSU với Rollback
Thay vì dùng Path Compression, chúng ta **chỉ** sử dụng **Union by Size**. Một tính chất quan trọng của cây khi chỉ dùng Union by Size là độ sâu tối đa của cây bị chặn bởi $\mathcal{O}(\log N)$. Do đó, thao tác `find(u)` mất thời gian $\mathcal{O}(\log N)$ trong trường hợp xấu nhất - chậm hơn một chút nhưng vô cùng cấu trúc.

Để có thể rollback thao tác `union`, chúng ta cần ghi nhớ lại những biến đổi cụ thể. Mỗi lần `union(u, v)` (giả sử $sz[u] \ge sz[v]$), chỉ có đúng 2 giá trị thay đổi:
- $parent[v]$ bị gán bằng $u$.
- $size[u]$ được cộng thêm $size[v]$.

Ta dùng một `std::vector` làm ngăn xếp (stack) sự kiện để đun đẩy các con trỏ và giá trị cũ vào lịch sử.

### Cài đặt (C++17)

```cpp
struct RollbackDSU {
    vector<int> p, sz;
    // Lưu các biến bị thay đổi theo dạng: {con trỏ tới biến, giá trị cũ}
    vector<pair<int*, int>> history;

    RollbackDSU(int n) {
        p.resize(n + 1);
        iota(p.begin(), p.end(), 0);
        sz.assign(n + 1, 1);
    }

    int find(int x) {
        // KHÔNG dùng Path Compression
        while (x != p[x]) x = p[x];
        return x;
    }

    bool unite(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) return false;
        
        if (sz[u] < sz[v]) swap(u, v);
        
        // Lưu trữ lại lịch sử trước khi thay đổi (gốc bị gán, và gốc nhận)
        history.push_back({&p[v], p[v]});
        history.push_back({&sz[u], sz[u]});
        
        p[v] = u;
        sz[u] += sz[v];
        return true; // Thực hiện hợp nhất thành công
    }

    // Lấy thời gian hiện tại (số lượng thay đổi)
    int time() const {
        return history.size();
    }

    // Hoàn tác đồ thị về trạng thái t
    void rollback(int t) {
        while (history.size() > t) {
            *history.back().first = history.back().second;
            history.pop_back();
        }
    }
};
```

## 3. Ứng dụng: Dynamic Connectivity Offline

Kỹ thuật nổi tiếng nhất đi đôi với DSU Rollback là thuật toán **Divide and Conquer on Time** (Chia để trị theo thời gian), hay còn gọi là Offline Dynamic Connectivity. Bài toán tiêu biểu: *Cho một đồ thị có các thao tác thêm cạnh, xóa cạnh và truy vấn hai đỉnh có liên thông không.*

Thay vì xóa cạnh trực tiếp, chúng ta xác định **tuổi thọ** (lifespan) của mỗi cạnh: cạnh $e$ tồn tại từ truy vấn thứ $L$ đến thứ $R$.
1. **Dựng Segment Tree trên trục thời gian:** Mỗi nút trên Segment Tree quản lý một đoạn thời gian $[l, r]$. Ta chèn cạnh $e$ vào $\mathcal{O}(\log Q)$ nút của Segment Tree bao phủ đoạn $[L, R]$.
2. **Duyệt DFS trên Segment Tree:** 
   - Khi vào một nút, ta `unite` tất cả các cạnh được lưu trữ tại nút đó.
   - Khi đến một nút lá (tương ứng với 1 thời điểm truy vấn), đồ thị tại lá đó chính là đồ thị thực tế tại thời điểm đó! Ta ngay lập tức có thể in ra đáp án (VD: 2 đỉnh có liên thông không, số thành phần liên thông).
   - Khi lùi lên (thực hiện xong 2 cây con), ta **gọi `rollback`** để khôi phục DSU về trạng thái trước khi vào nút đó.

Việc này cho phép giải bài toán Đồ thị Động trên tập truy vấn Offline với độ phức tạp $\mathcal{O}(Q \log Q \log N)$, một tốc độ kinh ngạc cho phép đánh bại các cấu trúc phức tạp như Link-Cut Tree.

## 4. Bài tập thực hành luyện tập

Dưới đây là một số bài tập kinh điển trên hệ thống để bạn luyện tập DSU Rollback ngay:

*   **Codeforces 813F - Bipartite Checking:** Một bài toán Dynamic Connectivity cổ điển yêu cầu check đồ thị hai phía, dùng DSU chia 2 đỉnh hoặc parity DSU kết hợp Rollback cực hay. [Luyện tập trên Codeforces](https://codeforces.com/contest/813/problem/F)
*   **CSES - Dynamic Connectivity:** Đếm số thành phần liên thông sau các truy vấn thêm xóa cạnh. Giới hạn thời gian gắt gao phù hợp với template DSU + SegTree bên trên. [CSES Problem Set](https://cses.fi/problemset/task/2133)
*   **USACO Gold - Closing the Farm:** Biến thể của việc thêm/xóa đỉnh có thể qui về làm DSU offline đảo ngược thời gian. [USACO Guide](https://usaco.guide/adv/dsu-rb?lang=cpp)

Hiểu và cài đặt thành thục hệ thống DSU Rollback sẽ là vũ khí quan trọng để bạn tackle các bài cấu trúc dữ liệu hạng nặng!

## Nguồn tham khảo (References)
- **Cơ sở thuật toán:** CP-Algorithms (Disjoint Set Union) và USACO Guide (Platinum Level - DSU with Rollback).
- **Phương pháp Cây đệ quy:** Nhấn mạnh trên nền tảng của bài giảng cấu trúc dữ liệu nâng cao (Advanced Data Structures) từ Codeforces blogs.
