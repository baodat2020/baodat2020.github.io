---
title: "Number Theoretic Transform (NTT)"
date: "2024-03-10"
excerpt: "Phép biến đổi Fourier nhanh phiên bản Số học. Một nâng cấp thiết yếu để thực hiện tích chập chính xác tuyệt đối trên một vành modul..."
readTime: "18 phút"
tag: "algo"
image: "assets/thumbnail_ntt.png"
---

# Number Theoretic Transform (NTT)

Phép biến đổi **Number Theoretic Transform (NTT)** chính là một "người anh em song sinh" của Fast Fourier Transform (FFT). Rất phổ biến trong các khối ngành Tính toán Tổ Hợp và các cuộc thi như ACM-ICPC, Codeforces, NTT cho phép bạn nhân hai đa thức với độ phức tạp $\mathcal{O}(N \log N)$ một cách **chính xác tuyệt đối 100%** trên vùng chia lấy dư mà không gặp vấn đề rủi ro sai số.

## 1. Vấn đề của FFT Cổ Điển (Float Precision)
Trong FFT chuẩn, chúng ta đánh giá và nội suy đa thức tại các **căn đơn vị phức** $n$ (complex $n$-th roots of unity): $W_n = e^{\frac{2\pi i}{n}}$.
Nhân hai đa thức yêu cầu thao tác nhân ma trận phức DFT, việc này sử dụng số học dấu phẩy động (kiểu `double` hoặc `long double`). Nếu hệ số của đa thức đủ lớn hoặc mảng siêu dài (VD $10^5$), sai số Floating Point bị dồn qua từng bước của thuật toán dạng bướm (Butterfly). Đến bước cuối cùng gọi hàm `round()` ép kiểu nguyên, ta bù trừ lệch số dẫn đến Wrong Answer một cách cực kỳ cay đắng. 

Nếu bài toán vốn dĩ yêu cầu in ra kết quả đếm cách modulo sinh học cho số dư (ví dụ $10^9 + 7$ hay $998244353$), thuật toán FFT trở nên vô dụng do không thể duy trì độ chuẩn xác. 

## 2. NTT & Căn Nguyên Thủy (Primitive Root)
Để giải quyết triệt để, NTT rời bỏ hệ trục số phức, và thực hiện biến đổi ngay trên **Trường Hữu Hạn** $\mathbb{F}_p$ (hay modulo $\mathbb{Z}_p$, trong đó $p$ là số nguyên tố).

Yêu cầu tiên quyết là trường $p$ đó phải có một **căn nguyên thủy** (Primitive Root) $g$.
Tính chất kinh điển của $g$:
$g^{p-1} \equiv 1 \pmod p$ 
và $g^k \not\equiv 1 \pmod p$ với mọi $k < p-1$.

Nếu ta cần nhân đa thức cực lớn độ dài $N = 2^k$ (yêu cầu bộ FFT hoạt động trên lũy thừa 2), ta phải bảo đảm $p-1$ chia hết cho $2^k$. Do đó, để NTT thân thiện (NTT-friendly primes), người ta sẽ làm viếc với các $P$ có dạng:
$$p = c \cdot 2^k + 1$$

Khi đó, để tạo bộ số thay thế cho $W_n$ (số phức quanh đường tròn đơn vị), ta dùng:
$$ \omega_N = g^{(p-1)/N} \pmod p $$
Mọi phép tính trong ma trận Fourier giờ đây không còn căn âm $i$ sinh học mà toàn bộ đều là số nguyên, cộng trừ nhân bình thường rồi $\pmod p$. Sức mạnh của sự chính xác lên ngôi!

## 3. Các hằng số quen thuộc trên Codeforces

Các modulo được dùng phổ biến trên Codeforces và các hằng số liên quan rất tiện để thu gọn code của bạn mà không cần tìm Primitive Root từ con số 0:
- $P = 998244353$ ($119 \cdot 2^{23} + 1$), $g = 3$
- $P = 1004535809$ ($479 \cdot 2^{21} + 1$), $g = 3$
- $P = 469762049$ ($7 \cdot 2^{26} + 1$), $g = 3$

*(Ghi chú: $998244353$ được sử dụng nhiều nhất vì nó nằm sát $10^9$, và độ lớn đủ để cộng dồn không tràn 32-bit int trước khi Modulo.*)

## 4. Implement NTT (C++ In-place Cooley-Tukey)

Mã giả C++ phổ thông hỗ trợ cả Inverse Transform được dùng bởi các Competitive Programmers (Tham khảo [youkn0wwho.academy](https://youkn0wwho.academy/)):

```cpp
const int MOD = 998244353;
const int G = 3;

long long binpow(long long a, long long b) {
    long long res = 1; a %= MOD;
    while (b > 0) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD; b >>= 1;
    }
    return res;
}

// NTT: a - mảng, invert - false (DFT), true (IDFT)
void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    // Bit-reversal permutation
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    // Cooley-Tukey 
    for (int len = 2; len <= n; len <<= 1) {
        long long wlen = binpow(G, (MOD - 1) / len);
        if (invert) wlen = binpow(wlen, MOD - 2);
            
        for (int i = 0; i < n; i += len) {
            long long w = 1;
            for (int j = 0; j < len / 2; j++) {
                long long u = a[i + j];
                long long v = a[i + j + len / 2] * w % MOD;
                a[i + j] = (u + v < MOD ? u + v : u + v - MOD);
                a[i + j + len / 2] = (u - v >= 0 ? u - v : u - v + MOD);
                w = w * wlen % MOD;
            }
        }
    }
    
    // Scale for IDFT
    if (invert) {
        long long n_inv = binpow(n, MOD - 2);
        for (long long& x : a) x = x * n_inv % MOD;
    }
}
```

## 5. Bài tập rèn luyện (Practice Problems)

Kỹ thuật nhân đa thức (NTT) thực sự là vũ khí hạng siêu nặng mà các Grandmaster luôn thủ sẵn trong tay khi gặp bài tổ hợp, hàm sinh (Generating Functions).

- **CSES - Polynomial Multiplication**: Bài tập kiểm tra Template đầu tay. Cực kỳ gọn. [Giải CSES 2111](https://cses.fi/problemset/task/2111).
- **Codeforces 1096G - Lucky Tickets**: Một bài Toán cực rành rọt dùng NTT biểu diễn đa thức trạng thái. [View CF 1096G](https://codeforces.com/problemset/problem/1096/G).
- **Codeforces 1334F - Restoring the Permutation**: DP chia để trị + NTT kinh điển. Bạn sẽ thấy đồ thị thời gian giảm từ $\mathcal{O}(N^2)$ xuống $\mathcal{O}(N \log^2 N)$ với NTT!
