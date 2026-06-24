/* link.ld - Linker script for Hazard3 bare metal */
/* SRAM is 128KB at address 0x0 */

MEMORY
{
    RAM (rwx) : ORIGIN = 0x00000000, LENGTH = 128K
}

SECTIONS
{
    /* Code starts at address 0 - startup code first */
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

    /* Stack grows down from top of RAM */
    _stack_top = ORIGIN(RAM) + LENGTH(RAM);
}
