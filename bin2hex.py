#!/usr/bin/env python3
# bin2hex.py - Convert flat binary to Verilog $readmemh format
# Pads with leading zeros so code lands at the reset vector offset (0x40).

import sys

# Reset vector is at 0x40, so code must start at byte offset 0x40 in memory
START_OFFSET = 0x40

if len(sys.argv) != 3:
    raise SystemExit(f"Usage: {sys.argv[0]} INPUT.bin OUTPUT.hex")

with open(sys.argv[1], "rb") as f:
    data = f.read()

# Prepend padding so code sits at START_OFFSET
data = (b"\x00" * START_OFFSET) + data

# Pad to a multiple of 4 bytes
while len(data) % 4 != 0:
    data += b"\x00"

with open(sys.argv[2], "w") as f:
    for i in range(0, len(data), 4):
        word = data[i] | (data[i+1] << 8) | (data[i+2] << 16) | (data[i+3] << 24)
        f.write(f"{word:08x}\n")

print(f"Wrote {len(data)//4} words ({START_OFFSET} byte offset + {len(data)-START_OFFSET} bytes code)")
