# EdgeMind dot4 Benchmark Results

Measured on Hazard3 RISC-V core, Basys 3 (Artix-7), ~74.77 MHz.
Workload: INT8 dot product over N=256 elements.

## Correctness
Software and hardware both compute -1 over 256 mixed signed elements. MATCH.

## Results
| Metric | Software | Custom dot4 | Ratio |
|--------|----------|-------------|-------|
| Instructions retired | 1800 | 456 | 3.94x |
| Cycles (mcycle) | 11020 | 652 | 16.9x |

## Interpretation
- Instruction count drops ~4x: dot4 processes 4 INT8 elements per instruction
  vs 1 per iteration in software (confirmed in disassembly).
- Cycle count drops ~17x: on top of the 4x instruction reduction, the software
  path uses the sequential multiplier (MUL_FAST=0, multi-cycle per mul), while
  dot4 performs four INT8 multiply-accumulates combinationally in a single cycle.
- The instruction-count ratio is the cleanest measure of the ISA extension's
  benefit; the cycle ratio additionally reflects the single-cycle MAC hardware.
