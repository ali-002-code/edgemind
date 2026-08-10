# Stock Hazard3 FPGA baseline

A like-for-like stock Hazard3 FPGA baseline has **not yet been measured**. No
incremental LUT, flip-flop, DSP, BRAM, or timing cost is therefore claimed for
the `dot4` extension.

The previous Raspberry Pi measurement was unrelated to this comparison and
has been removed to avoid presenting it as an FPGA baseline.

## Required comparison method

The baseline and EdgeMind builds must use the same:

- Hazard3 revision;
- Digilent Basys 3 / XC7A35T target;
- 128 KiB example-SoC SRAM configuration;
- extensions, performance counters, and multiplier configuration;
- firmware memory image;
- clock and I/O constraints;
- Vivado version and synthesis/implementation directives; and
- reporting stage (post-route).

The baseline should remove only the `dot4` decode and datapath changes. Record
total LUTs, flip-flops, DSPs, BRAMs, MMCMs, achieved setup/hold slack, and the
common constrained clock frequency for both builds.

Incremental resource cost can then be calculated as:

```text
EdgeMind total - stock Hazard3 total
```

Do not call the highest timing-clean constraint “Fmax” unless a documented
frequency search is performed with otherwise identical settings.
