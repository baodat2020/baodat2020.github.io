---
title: "Number Theoretic Transform (NTT)"
date: "2024-03-10"
excerpt: "Phép biến đổi Fourier nhanh phiên bản Số học. Một nâng cấp thiết yếu để thực hiện tích chập chính xác tuyệt đối trên một vành modul..."
readTime: "10 phút"
tag: "algo"
---

# Number Theoretic Transform (NTT)

Phép biến đổi **Number Theoretic Transform (NTT)** là một phiên bản "số học" của Fast Fourier Transform (FFT). Rất phổ biến trong các cuộc thi Lập trình cạnh tranh như ACM-ICPC, Codeforces hay AtCoder, NTT cho phép bạn nhân hai đa thức $\mathcal{O}(N \log N)$ một cách chính xác trên modulo mà không hề phụ thuộc số thực như thuật toán Cooley-Tukey thông thường, tránh được rủi ro sai số.

## Vấn đề với FFT cổ điển
Trong FFT, chúng ta đánh giá và nội suy đa thức tại các **căn đơn vị phức** $n$ (complex $n$-th roots of unity): $e^{\frac{2\pi i k}{n}}$. Tính toán này đòi hỏi số học dấu phẩy động (floating-point). Nếu hệ số của đa thức đủ lớn hoặc cấu trúc đa thức rất dài (ví dụ nhân 2 chuỗi nhị phân $10^5$), sai số do dấu khẩy phộng sau rất nhiều vòng thao tác cộng/nhân có thể vượt mức chịu đựng của hàm `round()`, dẫn tới kết quả phần tử mảng nguyên sai lệch.

## Chìa khóa: Căn nguyên thủy (Primitive Root)

Để thoát khỏi trục số phức, NTT áp dụng biến đổi trên **trường hữu hạn** $\mathbb{Z}_p$, trong đó $p$ là một số nguyên tố. Thường thì $p$ có dạng **NTT-friendly**:
$$p = c \cdot 2^k + 1$$
($N$ là độ dài đa thức lớn nhất mà ta có thể nhân mượt mà bằng FFT radix-2, thường $N=2^k$).

Thay vì lấy các đỉnh cách đều nhau trên góc quay $2\pi$ hình tròn, người ta dùng một số căn nguyên thủy $g$ thỏa mãn modulo $p$. Một tính chất kinh điển của $g$:
$(g^{(p-1)/n})^n \equiv 1 \pmod p$
với $n=2^k$.

Đây chính là sự thay thế cho số phức $W_n = e^{2\pi i / n}$!

## Modulo quen thuộc & Primitive Roots

Các modulo được dùng phổ biến trên Codeforces:
- $p = 998244353$ ($119 \cdot 2^{23} + 1$), $g = 3$
- $p = 1004535809$ ($479 \cdot 2^{21} + 1$), $g = 3$
- $p = 469762049$ ($7 \cdot 2^{26} + 1$), $g = 3$

## Dạng mã thông dụng trên Codeforces (C++)

Một cấu trúc chuẩn thường được các Competitive Programmers (bao gồm [bài tutorial trên Codeforces](https://codeforces.com/blog/entry/112521)) mang theo:

```cpp
const int MOD = 998244353;
const int G = 3;

// Hàm lũy thừa nhanh
long long binpow(long long a, long long b) {
    long long res = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

// NTT Implement (Cooley-Tukey In-place bit-reversal)
void ntt(vector<long long>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    
    for (int len = 2; len <= n; len <<= 1) {
        long long wlen = binpow(G, (MOD - 1) / len);
        if (invert)
            wlen = binpow(wlen, MOD - 2);
            
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
    
    if (invert) {
        long long n_inv = binpow(n, MOD - 2);
        for (long long& x : a) x = x * n_inv % MOD;
    }
}
```

## Tổng kết

Bạn có thể tận dụng đoạn code bên trên để tính tích phân, chia đa thức, hoặc các bài toán biến đổi tổ hợp phức tạp. Kỹ thuật nhân đa thức nhanh (NTT) thực sự là điểm thú vị mà những "Toán học sinh" thường đem theo bước đường chinh phục các Rank Grandmaster quốc tế. Đừng quên thử các bài Toán Combinatorics, Generating Functions lớn!
