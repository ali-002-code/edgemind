// dot4_bench.c - Benchmark: custom INT8 dot4 instruction vs software
// Measures cycles (mcycle) and instructions retired (minstret) for both.

#include <stdint.h>

#define UART_BASE 0x40004000
#define UART_CSR   (*(volatile uint32_t *)(UART_BASE + 0))
#define UART_DIV   (*(volatile uint32_t *)(UART_BASE + 4))
#define UART_FSTAT (*(volatile uint32_t *)(UART_BASE + 8))
#define UART_TX    (*(volatile uint32_t *)(UART_BASE + 12))
#define CSR_EN       0x1
#define FSTAT_TXFULL 0x100
#define DIV_INT  81
#define DIV_FRAC 6

void uart_init(void) {
    UART_DIV = (DIV_INT << 4) | (DIV_FRAC & 0xf);
    UART_CSR = CSR_EN;
}
void uart_putc(char c) {
    while (UART_FSTAT & FSTAT_TXFULL);
    UART_TX = (uint32_t)c;
}
void uart_puts(const char *s) {
    while (*s) { if (*s=='\n') uart_putc('\r'); uart_putc(*s++); }
}
void uart_putint(int32_t v) {
    char buf[12]; int i = 0; uint32_t u;
    if (v < 0) { uart_putc('-'); u = (uint32_t)(-v); } else u = (uint32_t)v;
    if (u == 0) { uart_putc('0'); return; }
    while (u) { buf[i++] = '0' + (u % 10); u /= 10; }
    while (i) uart_putc(buf[--i]);
}

// Read the cycle counter CSR (mcycle = 0xB00)
static inline uint32_t read_mcycle(void) {
    uint32_t c;
    asm volatile ("csrr %0, mcycle" : "=r"(c));
    return c;
}
// Read instructions-retired CSR (minstret = 0xB02)
static inline uint32_t read_minstret(void) {
    uint32_t c;
    asm volatile ("csrr %0, minstret" : "=r"(c));
    return c;
}

// Custom dot4 instruction
static inline int32_t dot4(uint32_t a, uint32_t b) {
    int32_t result;
    asm volatile (".insn r 0x0B, 0x1, 0x0, %0, %1, %2"
                  : "=r"(result) : "r"(a), "r"(b));
    return result;
}

#define N 256   // number of INT8 elements (multiple of 4)

// Two test vectors
int8_t va[N];
int8_t vb[N];

void init_vectors(void) {
    for (int i = 0; i < N; i++) {
        va[i] = (int8_t)((i % 7) - 3);    // small signed values
        vb[i] = (int8_t)((i % 5) - 2);
    }
}

// Software dot product: plain C loop
int32_t dot_software(void) {
    int32_t acc = 0;
    for (int i = 0; i < N; i++)
        acc += (int32_t)va[i] * (int32_t)vb[i];
    return acc;
}

// Hardware dot product: uses dot4, four elements per instruction
int32_t dot_hardware(void) {
    int32_t acc = 0;
    uint32_t *pa = (uint32_t *)va;
    uint32_t *pb = (uint32_t *)vb;
    for (int i = 0; i < N/4; i++)
        acc += dot4(pa[i], pb[i]);
    return acc;
}

int main(void) {
    uart_init();
    init_vectors();

    // Warm up / ensure caches irrelevant (no cache here, but keep structure)
    volatile int32_t sw_res, hw_res;
    uint32_t c0, c1, i0, i1;

    // Software timing
    c0 = read_mcycle();
    i0 = read_minstret();
    sw_res = dot_software();
    i1 = read_minstret();
    c1 = read_mcycle();
    uint32_t sw_cycles = c1 - c0;
    uint32_t sw_instrs = i1 - i0;

    // Hardware timing
    c0 = read_mcycle();
    i0 = read_minstret();
    hw_res = dot_hardware();
    i1 = read_minstret();
    c1 = read_mcycle();
    uint32_t hw_cycles = c1 - c0;
    uint32_t hw_instrs = i1 - i0;

    while (1) {
        uart_puts("=== EdgeMind dot4 benchmark (N=");
        uart_putint(N);
        uart_puts(") ===\n");

        uart_puts("Software result: "); uart_putint(sw_res); uart_puts("\n");
        uart_puts("Hardware result: "); uart_putint(hw_res);
        uart_puts(hw_res == sw_res ? "  [MATCH]\n" : "  [MISMATCH]\n");

        uart_puts("SW cycles:   "); uart_putint(sw_cycles); uart_puts("\n");
        uart_puts("HW cycles:   "); uart_putint(hw_cycles); uart_puts("\n");
        uart_puts("SW instrs:   "); uart_putint(sw_instrs); uart_puts("\n");
        uart_puts("HW instrs:   "); uart_putint(hw_instrs); uart_puts("\n");

        // Speedup x100 for two decimal places
        if (hw_cycles > 0) {
            uart_puts("Cycle speedup x100: ");
            uart_putint((int32_t)((sw_cycles * 100) / hw_cycles));
            uart_puts("\n");
        }
        uart_puts("\n");

        for (volatile int d = 0; d < 5000000; d++);
    }
    return 0;
}
