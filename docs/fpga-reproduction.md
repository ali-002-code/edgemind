# FPGA reproduction notes

EdgeMind has two reproducibility levels: automated open-source checks and the
board-specific Vivado implementation.

## Automated checks

GitHub Actions:

1. initialises the pinned Hazard3 submodule;
2. applies the EdgeMind HDL modifications;
3. generates 10,000 deterministic signed-INT8 vectors with an independent
   Python model;
4. runs the self-checking `dot4` testbench with Icarus Verilog; and
5. builds the bare-metal benchmark with the RISC-V GNU toolchain.

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
- 128 KiB SRAM (`SRAM_DEPTH = 1 << 15`);
- performance counters enabled;
- sequential baseline multiplier (`MUL_FAST = 0`); and
- `dot4_bench.hex` preloaded into block RAM.

The recorded post-route summary is:

- WNS: +0.398 ns;
- WHS: +0.027 ns;
- failing setup endpoints: 0;
- failing hold endpoints: 0; and
- total design utilisation: 3,346 LUTs, 1,500 flip-flops, 33 BRAMs,
  7 I/Os, and 1 MMCM.

These totals describe the complete Hazard3/EdgeMind SoC. They are not the
incremental cost of `dot4`.

## Archiving reports

After opening the routed implementation in Vivado, generate the evidence with:

```tcl
open_run impl_1
file mkdir reports
report_timing_summary -file reports/post_route_timing_summary.rpt
report_utilization -hierarchical -file reports/post_route_utilization.rpt
```

The hierarchical utilisation report is specifically required to confirm the
exact allocation of the 33 BRAMs. Source inspection shows that the configured
128 KiB SoC SRAM dominates BRAM demand; the current summary does not expose
the complete per-cell split.

## Current limitation

The repository does not yet contain the complete Basys 3 Vivado project,
board constraints, or raw Vivado reports. Reproducing synthesis and bitstream
generation therefore requires integrating the supplied top-level and HDL
changes into a local Hazard3 example-SoC Vivado project.

This limitation does not affect the automated RTL regression or firmware
build. A complete reproduction flow should add a pinned Vivado version, the
Basys 3 constraints, a Tcl build script, and the archived post-route reports.
