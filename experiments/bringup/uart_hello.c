// uart_hello.c - First UART test for Hazard3 on Basys 3
// Prints a message over UART to verify the preload pipeline works

#include <stdint.h>

// UART base address (from example_soc.v memory map)
#define UART_BASE 0x40004000

// Register offsets (from uart_regs.h)
#define UART_CSR   (*(volatile uint32_t *)(UART_BASE + 0))
#define UART_DIV   (*(volatile uint32_t *)(UART_BASE + 4))
#define UART_FSTAT (*(volatile uint32_t *)(UART_BASE + 8))
#define UART_TX    (*(volatile uint32_t *)(UART_BASE + 12))

// CSR bits
#define CSR_EN       0x1

// FSTAT bits
#define FSTAT_TXFULL 0x100

// Baud divider for 115200 at 75MHz with 8x oversample
// divisor = 75e6 / (115200 * 8) = 81.38
// INT = 81 (placed at bit 4), FRAC = 6 (placed at bit 0)
#define DIV_INT  81
#define DIV_FRAC 6

void uart_init(void) {
    // Set baud divider: INT in bits 4-13, FRAC in bits 0-3
    UART_DIV = (DIV_INT << 4) | (DIV_FRAC & 0xf);
    // Enable the UART
    UART_CSR = CSR_EN;
}

void uart_putc(char c) {
    // Wait until TX FIFO is not full
    while (UART_FSTAT & FSTAT_TXFULL)
        ;
    UART_TX = (uint32_t)c;
}

void uart_puts(const char *s) {
    while (*s) {
        if (*s == '\n')
            uart_putc('\r');  // CR before LF for terminal display
        uart_putc(*s++);
    }
}

int main(void) {
    uart_init();

    while (1) {
        uart_puts("Hello from Hazard3 on Basys 3!\n");
        // Crude delay so it doesn't flood the terminal
        for (volatile int i = 0; i < 2000000; i++)
            ;
    }

    return 0;
}
