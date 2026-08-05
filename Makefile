BUILD_DIR ?= build
IVERILOG ?= iverilog
VVP ?= vvp
RISCV_PREFIX ?= riscv64-unknown-elf-
CC := $(RISCV_PREFIX)gcc
OBJCOPY := $(RISCV_PREFIX)objcopy
OBJDUMP := $(RISCV_PREFIX)objdump

CFLAGS := -march=rv32im_zicsr -mabi=ilp32 -O2 -nostdlib -nostartfiles

.PHONY: all test test-dot4 firmware apply-hardware-patches clean

all: test firmware

$(BUILD_DIR):
	mkdir -p $@

test: test-dot4

test-dot4: | $(BUILD_DIR)
	$(IVERILOG) -g2012 -Wall -o $(BUILD_DIR)/test_dot4 \
		hardware_patches/hazard3_dot4_int8.v test_dot4.v
	$(VVP) $(BUILD_DIR)/test_dot4

firmware: | $(BUILD_DIR)
	$(CC) $(CFLAGS) -T link.ld -Wl,-Map,$(BUILD_DIR)/dot4_bench.map \
		-o $(BUILD_DIR)/dot4_bench.elf start.S dot4_bench.c
	$(OBJCOPY) -O binary $(BUILD_DIR)/dot4_bench.elf $(BUILD_DIR)/dot4_bench.bin
	$(OBJDUMP) -d $(BUILD_DIR)/dot4_bench.elf > $(BUILD_DIR)/dot4_bench.disasm
	python3 bin2hex.py $(BUILD_DIR)/dot4_bench.bin $(BUILD_DIR)/dot4_bench.hex

apply-hardware-patches:
	./scripts/apply_hardware_patches.sh

clean:
	rm -rf -- $(BUILD_DIR)
