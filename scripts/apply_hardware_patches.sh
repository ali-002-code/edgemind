#!/usr/bin/env sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
hazard3_dir="$repo_root/hazard3"
expected_revision=0d59d3065dd39552ad59e3c314a2cf6b800cc9d0

if [ ! -f "$hazard3_dir/hdl/hazard3_core.v" ]; then
    echo "Hazard3 is not initialized. Run: git submodule update --init" >&2
    exit 1
fi

actual_revision=$(git -C "$hazard3_dir" rev-parse HEAD)
if [ "$actual_revision" != "$expected_revision" ]; then
    echo "Hazard3 is at $actual_revision; expected $expected_revision." >&2
    echo "Run: git submodule update --init --force hazard3" >&2
    exit 1
fi

for name in hazard3_core.v hazard3_decode.v hazard3_ops.vh hazard3_width_const.vh rv_opcodes.vh; do
    cp "$repo_root/hardware_patches/$name" "$hazard3_dir/hdl/$name"
done

cp "$repo_root/hardware_patches/hazard3_dot4_int8.v" \
    "$hazard3_dir/hdl/arith/hazard3_dot4_int8.v"

echo "Applied EdgeMind HDL changes to the pinned Hazard3 checkout."
