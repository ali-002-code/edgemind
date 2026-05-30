`timescale 1ns/1ps

`define W_ADDR 32
`define W_DATA 32
`define W_REGADDR 5

module test_decode;

reg clk = 0;
reg rst_n = 0;

// Instruction input
reg [31:0] fd_cir = 0;
reg [1:0]  fd_cir_err = 0;
reg [1:0]  fd_cir_predbranch = 0;
reg [1:0]  fd_cir_vld = 2'b11;
reg        fd_cir_is_32bit = 1;
reg        fd_cir_invalid_16bit = 0;
reg        fd_cir_is_uop = 0;
reg        fd_cir_uop_nonfinal = 0;
reg        fd_cir_uop_no_pc_update = 0;
reg        fd_cir_uop_atomic = 0;

// Decoded outputs
wire [4:0]  d_rs1;
wire [4:0]  d_rs2;
wire [4:0]  d_rd;

// Clock
always #5 clk = ~clk;

// Instantiate decoder
hazard3_decode dut (
    .clk(clk),
    .rst_n(rst_n),
    .fd_cir(fd_cir),
    .fd_cir_err(fd_cir_err),
    .fd_cir_predbranch(fd_cir_predbranch),
    .fd_cir_vld(fd_cir_vld),
    .fd_cir_is_32bit(fd_cir_is_32bit),
    .fd_cir_invalid_16bit(fd_cir_invalid_16bit),
    .fd_cir_is_uop(fd_cir_is_uop),
    .fd_cir_uop_nonfinal(fd_cir_uop_nonfinal),
    .fd_cir_uop_no_pc_update(fd_cir_uop_no_pc_update),
    .fd_cir_uop_atomic(fd_cir_uop_atomic),
    .d_rs1(d_rs1),
    .d_rs2(d_rs2),
    .d_rd(d_rd)
);

initial begin
    // Reset
    rst_n = 0;
    #20;
    rst_n = 1;
    #10;

    // ADD x3, x1, x2
    // opcode=0110011, rd=x3, funct3=000, rs1=x1, rs2=x2, funct7=0000000
    fd_cir = 32'b0000000_00010_00001_000_00011_0110011;
    #10;
    $display("ADD x3,x1,x2 -> rs1=%0d rs2=%0d rd=%0d (expect 1,2,3)", d_rs1, d_rs2, d_rd);

    // ADDI x5, x1, 10
    // opcode=0010011, rd=x5, funct3=000, rs1=x1, imm=10
    fd_cir = 32'b000000001010_00001_000_00101_0010011;
    #10;
    $display("ADDI x5,x1,10 -> rs1=%0d rd=%0d (expect 1,5)", d_rs1, d_rd);

    #20;
    $finish;
end

endmodule
