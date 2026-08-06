# FPGA reproduction notes

EdgeMind has two reproducibility levels: the automated open-source checks and
the board-specific Vivado flow.

## Automated checks

GitHub Actions performs the parts that do not require proprietary tools:

1. initialises the pinned Hazard3 submodule;
2. applies the EdgeMind HDL modifications;
3. runs the self-checking `dot4` testbench with Icarus Verilog; and
4. builds the bare-metal benchmark with the RISC-V GNU toolchain.

Run the same checks locally with:

```bash
make test
make firmware
make apply-hardware-patches
```

## Basys 3 implementation

The checked-in `hardware_patches/fpga_basys3.v` captures the top-level
configuration used for the reported result:

- target: Digilent Basys 3, Xilinx Artix-7 XC7A35T;
- system clock: 60.15 MHz;
- UART: 115200 baud;
- performance counters enabled;
- sequential baseline multiplier (`MUL_FAST = 0`); and
- `dot4_bench.hex` preloaded into block RAM.

The published timing result is recorded in `benchmarks/dot4_results.md`.

## Current limitation

The repository does not yet contain a complete one-command Vivado project,
board constraints, or the raw Vivado timing report. Reproducing synthesis and
bitstream generation therefore requires integrating the supplied top-level
and HDL modifications into a local Hazard3 example-SoC Vivado project.

This limitation does not affect the automated RTL test or firmware build. A
future release should add a pinned Vivado version, Basys 3 constraints, a Tcl
build script, and archived timing/utilisation reports so the FPGA result can be
recreated without manual project setup.
