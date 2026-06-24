#!/usr/bin/env python3
# bin2hex.py - Convert flat binary to Verilog $readmemh format
# One 32-bit word per line, little-endian, hex

import sys

with open(sys.argv[1], "rb") as f:
    data = f.read()

# Pad to a multiple of 4 bytes
while len(data) % 4 != 0:
    data += b"\x00"

# Output one 32-bit little-endian word per line
with open(sys.argv[2], "w") as f:
    for i in range(0, len(data), 4):
        word = data[i] | (data[i+1] << 8) | (data[i+2] << 16) | (data[i+3] << 24)
        f.write(f"{word:08x}\n")

print(f"Converted {len(data)} bytes -> {len(data)//4} words")
