/* link.ld - Linker script for Hazard3 bare metal */
/* SRAM is 128KB at address 0x0 */

MEMORY
{
    RAM (rwx) : ORIGIN = 0x00000000, LENGTH = 128K
}

SECTIONS
{
    /* Hazard3 resets at 0x40. Keep linked addresses aligned with preload. */
    . = ORIGIN(RAM) + 0x40;

    .text : {
        *(.text.init)      /* startup code goes first */
        *(.text*)          /* all other code */
        *(.rodata*)        /* read-only data, string constants */
    } > RAM

    /* Initialised data */
    .data : {
        *(.data*)
    } > RAM

    /* Zero-initialised data */
    .bss : {
        _bss_start = .;
        *(.bss*)
        *(COMMON)
        _bss_end = .;
    } > RAM

    ASSERT(. <= ORIGIN(RAM) + LENGTH(RAM), "RAM overflow")

    /* Stack grows down from top of RAM */
    _stack_top = ORIGIN(RAM) + LENGTH(RAM);
}
