# EdgeMind dot4 Benchmark Results

Hazard3 RISC-V core with custom INT8 dot4 instruction, on Basys 3 (Artix-7 xc7a35t).

## Build configuration (timing-clean)
- System clock: 60.15 MHz (MMCM: 100 MHz x 10 / 16.625)
- WNS +0.398 ns, WHS +0.027 ns
- 0 failing setup endpoints and 0 failing hold endpoints
- MUL_FAST = 0 (sequential multiplier for software baseline)
- CSR_COUNTER = 1 (mcycle / minstret enabled)

## Workload
INT8 dot product over N=256 elements, mixed signed values.
Software: one element per loop iteration, scalar mul + add.
Hardware: four elements per iteration via custom dot4 instruction.

## Correctness
Software and hardware both return -1. MATCH.

## Results
| Metric | Software | dot4 | Ratio |
|--------|----------|------|-------|
| Instructions retired | 1800 | 456 | 3.94x |
| Cycles | 11020 | 652 | 16.90x |

## Whole-design FPGA utilisation

| Resource | Used | Available | Utilisation |
|----------|-----:|----------:|------------:|
| LUT | 3,346 | 20,800 | 16.09% |
| Flip-flop | 1,500 | 41,600 | 3.61% |
| Block RAM | 33 | 50 | 66.00% |
| I/O | 7 | 106 | 6.60% |
| MMCM | 1 | 5 | 20.00% |

These figures are for the complete implemented Hazard3/EdgeMind SoC, not the
incremental cost of the `dot4` instruction. A like-for-like stock Hazard3
implementation has not yet been measured.

## Interpretation
- The ~3.94x instruction reduction is the direct effect of the ISA extension:
  dot4 consumes four INT8 pairs per instruction versus one per software iteration.
  Confirmed in the disassembly: both inner loops are 7 instructions, but the
  dot4 loop retires one iteration per four elements.
- The larger 16.90x cycle reduction additionally reflects that the software path
  uses Hazard3's sequential multiplier (MUL_FAST=0), which takes multiple cycles
  per multiply, whereas dot4 performs four INT8 multiply-accumulates combinationally
  in a single cycle.
- MUL_FAST=1 was evaluated as a fairer software baseline but fails timing on this
  device: WNS -1.130 ns with 368 failing endpoints even under Flow_AlternateRoutability
  synthesis and Performance_ExtraTimingOpt implementation. The 32x32 multiplier is
  decomposed across 3 DSP48E1 blocks plus ~900 additional LUTs, and the partial-product
  recombination becomes the critical path.

## Timing note
The dot4 unit itself is the critical path in the final design: register-file BRAM
read -> four 8x8 multiplies -> 3-level adder tree -> xm_result register, 18 logic
levels, 14.58 ns data path delay. This sets the 60.15 MHz ceiling. Pipelining the
adder tree into a second stage is the natural next optimisation.
