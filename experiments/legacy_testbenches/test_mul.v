`timescale 1ns/1ps

module test_mul;
    reg clk = 0;
    reg rst_n = 0;
    reg op_vld = 0;
    reg [31:0] op_a = 0;
    reg [31:0] op_b = 0;
    wire [31:0] result;
    wire result_vld;

    // Instantiate the multiplier
    hazard3_mul_fast #() dut (
        .clk(clk),
        .rst_n(rst_n),
        .op(2'b00),
        .op_vld(op_vld),
        .op_a(op_a),
        .op_b(op_b),
        .result(result),
        .result_vld(result_vld)
    );

    // Clock: toggle every 5ns = 100MHz
    always #5 clk = ~clk;

    // Dump waveforms
    initial begin
        $dumpfile("mul_wave.vcd");
        $dumpvars(0, test_mul);

        // Reset
        rst_n = 0;
        #20;
        rst_n = 1;
        #10;

        // Test 1: 6 x 7 = 42
        op_a = 32'd6;
        op_b = 32'd7;
        op_vld = 1;
        #10;
        op_vld = 0;
        #20;
        $display("6 x 7 = %0d (expected 42)", result);

        // Test 2: 100 x 200 = 20000
        op_a = 32'd100;
        op_b = 32'd200;
        op_vld = 1;
        #10;
        op_vld = 0;
        #20;
        $display("100 x 200 = %0d (expected 20000)", result);

        #20;
        $finish;
    end
endmodule
