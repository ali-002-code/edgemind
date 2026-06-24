# start.S - Startup code for Hazard3 bare metal
# Runs first at power-on (address 0), sets up stack, calls main

.section .text.init
.global _start

_start:
    # Set up the stack pointer
    # SRAM is 128KB starting at 0x0. Put stack at the top.
    li sp, 0x00020000      # 128KB = 0x20000

    # Clear the BSS section (zero-initialised global variables)
    la t0, _bss_start
    la t1, _bss_end
bss_clear_loop:
    bge t0, t1, bss_clear_done
    sw zero, 0(t0)
    addi t0, t0, 4
    j bss_clear_loop
bss_clear_done:

    # Jump to main
    call main

    # If main returns, loop forever
hang:
    j hang
