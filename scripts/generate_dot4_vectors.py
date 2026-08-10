#!/usr/bin/env python3
"""Generate deterministic dot4 vectors from an independent Python model."""

import argparse
import random
from pathlib import Path


def pack_int8(values: list[int]) -> int:
    packed = 0
    for lane, value in enumerate(values):
        packed |= (value & 0xFF) << (8 * lane)
    return packed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=10_000)
    parser.add_argument("--seed", type=lambda value: int(value, 0), default=0xED6E)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if args.count < 1:
        parser.error("--count must be positive")

    rng = random.Random(args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)

    with args.output.open("w", encoding="ascii") as vectors:
        for _ in range(args.count):
            lanes_a = [rng.randint(-128, 127) for _ in range(4)]
            lanes_b = [rng.randint(-128, 127) for _ in range(4)]
            expected = sum(a * b for a, b in zip(lanes_a, lanes_b))
            vectors.write(
                f"{pack_int8(lanes_a):08x} "
                f"{pack_int8(lanes_b):08x} {expected}\n"
            )

    print(
        f"generated {args.count} deterministic vectors "
        f"with seed 0x{args.seed:x}"
    )


if __name__ == "__main__":
    main()
