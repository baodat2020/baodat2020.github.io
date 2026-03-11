# Disjoint Set Union (DSU) với Rollback — Kỹ thuật quay lui thời gian

Xin chào mọi người! DSU (Disjoint Set Union) là một cấu trúc dữ liệu cực kì quen thuộc trong Competitive Programming. Chắc hẳn ai cũng từng dùng nó để tìm các thành phần liên thông của đồ thị, hoặc đỉnh cao hơn là dùng trong thuật toán Kruskal tìm cây khung nhỏ nhất.

Tuy nhiên, dạng DSU cơ bản chỉ hỗ trợ việc **thêm cạnh** (Union). Vậy nếu bài toán yêu cầu **thêm cạnh, xóa cạnh, và truy vấn** liên tục thì sao? Lúc này, DSU với Path Compression (nén đường) không thể giúp ta "xóa" một cạnh dễ dàng được. Đó là lúc chúng ta cần đến **DSU with Rollback**.

Hôm nay mình sẽ đi chi tiết vào cách xây dựng cấu trúc này nhé.

---

## 1. Tại sao phải dùng DSU Rollback?

Có một dạng bài toán kinh điển gọi là **Dynamic Connectivity** (Tính liên thông động).
Cho đồ thị $N$ đỉnh. Có $Q$ thao tác, mỗi thao tác thuộc một trong 3 loại:

1. Thêm một cạnh nối đỉnh $u$ và $v$.
2. Xóa cạnh nối đỉnh $u$ và $v$ (cạnh này đang tồn tại).
3. Kiểm tra xem $u$ và $v$ có đang liên thông hay không.

Nếu giải bài này với các cạnh tĩnh, DSU làm rất tốt. Nhưng với thao tác **xóa cạnh**, DSU thông thường chịu bó tay. Vì sao? Vì kĩ thuật **Path Compression** (nén đường) làm bẹp cấu trúc cây gốc của DSU, khiến thao tác xóa một cạnh cụ thể trở nên rối rắm và sai lệch cấu trúc.

**Giải pháp:**

1. Bỏ Path Compression đi! Chỉ dùng **Union by Size/Rank** (Gộp theo kích thước/độ sâu). Cây DSU sẽ luôn có độ sâu logarit $O(\log N)$.
2. Áp dụng kỹ thuật **Rollback** (Quay lui): Ghi nhớ lại những thay đổi trạng thái khi gọi hàm `Union`, và khi cần "xóa", ta đơn giản là khôi phục lại trạng thái cũ (Undo).

Thường DSU Rollback sẽ đi kèm với kỹ thuật **Divide and Conquer Optimization (D&C trên mốc thời gian)**, hay còn gọi là *Offline Dynamic Connectivity*.

---

## 2. Implement DSU Rollback bằng C++

Điểm mấu chốt ở đây là tạo một cấu trúc `stack` để lưu lại sự thay đổi trạng thái của DSU.

Mỗi khi ta gắn gốc $y$ vào gốc $x$, ta thay đổi `parent[y] = x` và `sz[x] += sz[y]`. Ta sẽ đẩy thông tin của `x` và `y` vào một Stack. Khi Rollback, ta chỉ việc `pop` Stack ra và khôi phục cài đặt gốc!

```cpp
#include <bits/stdc++.h>
using namespace std;

struct DSU_Rollback {
    vector<int> parent, sz;
    
    // stack lưu lại các thao tác nối cạnh để quay lui
    // Mỗi phần tử lưu: {u, v, sz_of_u}
    // nghia la: ta đã nối v gốc vào u gốc, và size ban đầu của u
    vector<tuple<int, int, int>> history;

    DSU_Rollback(int n) {
        parent.resize(n + 1);
        sz.assign(n + 1, 1);
        iota(parent.begin(), parent.end(), 0);
    }

    // TÌM GỐC: Chú ý KHÔNG DÙNG Path Compression
    int find_set(int v) {
        // trả về parent[v] nếu v là gốc, ngược lại gọi đệ quy
        if (v == parent[v])
            return v;
        return find_set(parent[v]); 
        // LƯU Ý: Không gán parent[v] = find_set(parent[v]) nhứ DSU thường
    }

    // GỘP: Dùng Union by Size
    bool union_sets(int a, int b) {
        a = find_set(a);
        b = find_set(b);
        
        if (a != b) {
            // Luôn gắn cây nhỏ vào cây lớn
            if (sz[a] < sz[b])
                swap(a, b);
                
            // Lưu lại lịch sử trước khi thay đổi
            history.push_back({a, b, sz[a]});
            
            // Thực hiện gộp b vào a
            parent[b] = a;
            sz[a] += sz[b];
            return true;
        }
        
        // Trả về false nếu a và b đã cùng thành phần liên thông
        // Ta vẫn nên lưu một đánh dấu "rỗng" vào history để dễ gọi rollback
        history.push_back({-1, -1, -1});
        return false;
    }

    // ROLLBACK: Khôi phục lại thao tác nối cạnh gần nhất
    void rollback() {
        if (history.empty()) return;
        
        auto [a, b, size_a] = history.back();
        history.pop_back();

        // Nếu đây là thao tác union thành công
        if (a != -1) {
            parent[b] = b; // Tách b ra làm gốc riêng lại
            sz[a] = size_a; // Trả lại kích thước cho a
        }
    }
    
    // Trả về số lượng thao tác hiện tại trong stack
    int get_checkpoint() {
        return history.size();
    }
    
    // Quay lui về một mốc thời gian cụ thể
    void rollback_to(int checkpoint) {
        while (history.size() > checkpoint) {
            rollback();
        }
    }
};
```

---

## 3. Độ phức tạp (Complexity)

Bởi vì chúng ta **từ bỏ Path Compression** và chỉ dùng **Union by Size/Rank**, chiều cao tối đa của cây DSU luôn bị giới hạn lại là $O(\log N)$.

- Thao tác `find_set(v)`: Chạy mất $O(\log N)$.
- Thao tác `union_sets(u, v)`: Gọi 2 lệnh find, nên cũng mất $O(\log N)$.
- Thao tác `rollback()`: Chỉ khôi phục vài phép gán biến, chạy mất $O(1)$.

Tuy không "thần tốc" cỡ $O(\alpha(N))$ như DSU bình thường, mức $O(\log N)$ cực kỳ xuất sắc và thừa sức AC được các bài toán giới hạn $N \le 10^5$.

---

## 4. Ứng dụng: D&C on SegTree (Offline Dynamic Connectivity)

Như mình nhắc ở phần 1, DSU Rollback ít khi đứng một mình mà hay được kết hợp với một dạng **Segment Tree thời gian**.

Tưởng tượng bài toán cho chúng ta biết trước trọn bộ các cạnh thêm vào, xóa đi ở những thời điểm nào.
Mỗi cạnh $E_i$ sẽ "tồn tại" trong một khoảng thời gian $[L_i, R_i]$. Ta có thể đẩy thẳng cạnh đó vào một Segment Tree, trong đó mỗi Node quản lý một khoảng thời gian.

**Cấu trúc hàm Traverse (Duyệt SegTree):**

1. Đến một Node `u` của SegTree, thực hiện `union_sets` toàn bộ cạnh đang chứa trong Node `u`.
2. Nếu `u` là lá (thời điểm $t$), tiến hành trả lời truy vấn của thời điểm $t$.
3. Ngược lại, gọi đệ quy Traverse con trái, con phải.
4. Xong việc rời khỏi Node `u`: Gọi vòng lặp `rollback()` trả trạng thái DSU về hệt như lúc mới bắt đầu bước 1.

Đây là một template kinh điển và vô cùng thanh lịch của Competitive Programming để xử lý đồ thị thay đổi liên tục. Bạn có thể luyện tập dạng kĩ thuật này bằng cách submit bài [CSES - Dynamic Connectivity](https://cses.fi/problemset/task/2133).

Chúc các bạn thành công và sớm lên Rank nhé! 🚀
Cảm ơn vì đã ghé đọc bài viết của Đạt.
