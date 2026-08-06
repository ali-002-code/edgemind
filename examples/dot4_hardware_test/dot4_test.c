// dot4_test.c - Test the custom INT8 dot-product instruction on hardware
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
// Print a signed 32-bit integer in decimal
void uart_putint(int32_t v) {
    char buf[12];
    int i = 0;
    uint32_t u;
    if (v < 0) { uart_putc('-'); u = (uint32_t)(-v); }
    else u = (uint32_t)v;
    if (u == 0) { uart_putc('0'); return; }
    while (u) { buf[i++] = '0' + (u % 10); u /= 10; }
    while (i) uart_putc(buf[--i]);
}

// Custom dot4 instruction via inline assembly.
// R-type: opcode=0x0B (0001011), funct3=1, funct7=0
static inline int32_t dot4(uint32_t a, uint32_t b) {
    int32_t result;
    asm volatile (".insn r 0x0B, 0x1, 0x0, %0, %1, %2"
                  : "=r"(result) : "r"(a), "r"(b));
    return result;
}

int main(void) {
    uart_init();

    // Test: a = [4,3,2,1] packed, b = [1,1,1,1] packed
    // Expected: 1*1 + 2*1 + 3*1 + 4*1 = 10
    uint32_t a = (4 << 24) | (3 << 16) | (2 << 8) | 1;
    uint32_t b = (1 << 24) | (1 << 16) | (1 << 8) | 1;

    while (1) {
        int32_t r = dot4(a, b);
        uart_puts("dot4([1,2,3,4],[1,1,1,1]) = ");
        uart_putint(r);
        uart_puts("  (expect 10)\n");
        for (volatile int i = 0; i < 2000000; i++);
    }
    return 0;
}
