# EdgeMind

A custom RISC-V processor with a hardware INT8 dot-product instruction for accelerating neural network inference on an FPGA.

EdgeMind extends the open-source Hazard3 RISC-V core with a custom instruction, `dot4`, that computes a four-element INT8 dot product in a single instruction. The instruction is integrated directly into the processor pipeline and evaluated on a Digilent Basys 3 FPGA.

Measured on real hardware, the custom instruction executes the same workload using **3.94× fewer instructions** and **16.9× fewer clock cycles** than the equivalent software implementation while meeting timing at **60.15 MHz**.

---

# Results

The benchmark performs a 256-element INT8 dot product on the same processor using two implementations:

- a standard C implementation
- the custom `dot4` instruction

| Metric | Software | dot4 | Improvement |
|---------|----------|------|-------------|
| Instructions retired | 1800 | 456 | **3.94× fewer** |
| Clock cycles | 11020 | 652 | **16.9× fewer** |
| CPI | ~6.1 | ~1.4 | |

Both implementations produce identical numerical results, confirming the correctness of the instruction.

Performance was measured directly on the FPGA using the RISC-V `mcycle` and `minstret` CSRs.

The final design closes timing at **60.15 MHz** with:

- Worst Negative Slack (WNS): **+0.398 ns**
- Failing endpoints: **0**

## Why is the cycle improvement larger than the instruction improvement?

Two independent effects combine.

The **3.94× instruction reduction** comes directly from the ISA extension: each `dot4` instruction processes four INT8 multiply-accumulate operations instead of one.

The **16.9× cycle reduction** is larger because the baseline software implementation uses Hazard3's sequential multi-cycle multiplier, which stalls the pipeline during every multiplication. In contrast, `dot4` performs all four multiplications in parallel inside dedicated hardware and returns the result in a single pipeline stage.

This is reflected in the measured CPI:

- Software: approximately **6.1 CPI**
- `dot4`: approximately **1.4 CPI**

---

# Architecture

## The instruction

`dot4` is implemented as a custom R-type instruction using the RISC-V **custom-0** opcode space (`0001011`, `funct3 = 001`).

Each source register contains four packed signed INT8 values.

```
rs1 = {a3, a2, a1, a0}
rs2 = {b3, b2, b1, b0}
```

The instruction computes

```text
rd = a0*b0 + a1*b1 + a2*b2 + a3*b3
```

and writes the 32-bit accumulated result into `rd`.

The instruction is conceptually similar to Arm's SDOT instruction.

---

## Hardware implementation

The execution unit (`hazard3_dot4_int8.v`) performs the following operations entirely combinationally:

1. unpack eight signed INT8 operands
2. compute four 8×8 signed multiplications in parallel
3. sum the four products through an adder tree
4. write the final 32-bit result back to the register file

The entire operation completes in one instruction with no multiplier stalls.

---

## Integration into Hazard3

Supporting the new instruction required modifications throughout the processor.

### ISA definitions

- `rv_opcodes.vh`
- `hazard3_ops.vh`
- `hazard3_width_const.vh`

A new internal multiply operation was added, expanding the multiply operation field from three bits to four bits.

### Decode stage

`hazard3_decode.v`

- recognise the custom opcode
- generate the new internal operation
- route execution through the existing multiply datapath

### Execute / Writeback

`hazard3_core.v`

- instantiate the custom execution unit
- connect register operands
- multiplex the result into writeback
- bypass the sequential multiplier stall logic

---

## Software

The benchmark is written in standard C.

`dot4` is exposed using GCC inline assembly via the `.insn` directive, allowing ordinary C code to invoke the custom instruction without modifying the compiler.

Programs are

1. compiled with the RISC-V GCC toolchain
2. converted into a binary image
3. converted into a BRAM hex file
4. preloaded into FPGA block RAM during synthesis

After programming the FPGA, the benchmark runs automatically and prints its results over UART.

---

# Timing verification

An earlier version of the design produced correct benchmark output but failed FPGA timing analysis.

The critical path passed through

- register file read
- four parallel multipliers
- adder tree
- writeback register

and exceeded the target clock period by roughly **1.3 ns**.

Although the benchmark appeared to execute correctly, results from a timing-violating FPGA design cannot be considered reliable.

Rather than report those measurements, the design was corrected by reducing the operating frequency until timing closure was achieved.

The final implementation closes timing with

- WNS = **+0.398 ns**
- zero failing endpoints

The measured instruction counts and cycle counts remain unchanged because they are independent of clock frequency, but the reported results now come from a design that is demonstrably timing-correct.

---

## Why not enable Hazard3's fast multiplier?

For comparison, the single-cycle 32×32 multiplier configuration was also evaluated.

On the Basys 3 device this implementation failed timing because the multiplier spans three DSP blocks together with approximately 900 LUTs for partial-product recombination, creating an even longer critical path.

The much narrower INT8 datapath therefore provides both

- higher throughput
- a shorter critical path

This illustrates one of the reasons quantised arithmetic is widely used for neural network inference.

---

# Building the project

## Hardware

- Digilent Basys 3
- Xilinx Artix-7 XC7A35T FPGA

## Toolchain

- RISC-V GCC (`riscv64-unknown-elf-gcc`)
- Vivado
- Python 3

## Build the benchmark

```bash
riscv64-unknown-elf-gcc \
  -march=rv32im_zicsr \
  -mabi=ilp32 \
  -O2 \
  -nostdlib \
  -nostartfiles \
  -T link.ld \
  -o dot4_bench.elf \
  start.S dot4_bench.c

riscv64-unknown-elf-objcopy \
  -O binary \
  dot4_bench.elf \
  dot4_bench.bin

python3 bin2hex.py dot4_bench.bin dot4_bench.hex
```

The generated hex image is preloaded into the FPGA block RAM during synthesis.

Programming the FPGA causes the benchmark to execute automatically and print results over UART at **115200 baud**.

## FPGA configuration

`fpga_basys3.v`

- System clock: **60.15 MHz**
- `CSR_COUNTER = 1`
- `MUL_FAST = 0`

---

# Repository structure

```
hazard3/
    hdl/
        arith/
            hazard3_dot4_int8.v

dot4_bench.c
start.S
link.ld

benchmarks/
    dot4_results.md

README.md
```

---

# Future work

## Pipeline the execution unit

The current `dot4` implementation is entirely combinational and forms the processor's critical path.

A natural extension would be to split the datapath into two pipeline stages by registering the multiplication results before the final accumulation.

This would increase instruction latency by one cycle but should permit a significantly higher clock frequency.

Evaluating this trade-off would require measuring

- execution time
- CPI
- maximum clock frequency
- FPGA resource usage

to determine whether the higher operating frequency outweighs the additional pipeline stage.

## Wider vector operations

`dot4` processes four INT8 values per instruction.

Future extensions could introduce wider packed operations, such as eight-element dot products using register pairs, increasing arithmetic density while exploring the trade-off between hardware complexity and software overhead.

---

EdgeMind demonstrates how a lightweight ISA extension can substantially accelerate quantised neural network workloads on FPGA hardware while preserving a conventional RISC-V software development flow.
