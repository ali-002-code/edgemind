# dot4 hardware smoke test

This directory contains the small UART program used during initial on-board
validation of the custom instruction.

- `dot4_test.c` invokes `dot4` with a known input and prints the result.
- `dot4_test.hex` is the corresponding reference block-RAM image.

The measured performance results in the main README use `dot4_bench.c` and
`dot4_bench.hex`, not this smoke test.
