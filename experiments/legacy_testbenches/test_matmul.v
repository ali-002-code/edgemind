`timescale 1ns/1ps

module test_matmul;

reg clk = 0;
reg rst_n = 0;
reg op_vld = 0;
reg [127:0] matrix_a = 0;
reg [127:0] matrix_b = 0;
wire [511:0] result;
wire result_vld;

// Instantiate matmul unit
hazard3_matmul_int8 dut (
    .clk(clk),
    .rst_n(rst_n),
    .op_vld(op_vld),
    .matrix_a(matrix_a),
    .matrix_b(matrix_b),
    .result(result),
    .result_vld(result_vld)
);

// Clock
always #5 clk = ~clk;

// Helper function to pack a value into matrix position
task set_a;
    input [1:0] row, col;
    input signed [7:0] val;
    begin
        matrix_a[((row*4)+col)*8 +: 8] = val;
    end
endtask

task set_b;
    input [1:0] row, col;
    input signed [7:0] val;
    begin
        matrix_b[((row*4)+col)*8 +: 8] = val;
    end
endtask

// Helper to read result
function signed [31:0] get_result;
    input [3:0] idx;
    begin
        get_result = result[idx*32 +: 32];
    end
endfunction

integer i;

initial begin
    $dumpfile("matmul_wave.vcd");
    $dumpvars(0, test_matmul);

    // Reset
    rst_n = 0;
    #20;
    rst_n = 1;
    #10;

    // Test 1: Multiply by identity matrix
    // A = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]
    // B = identity matrix
    // Result should equal A
    matrix_a = 0;
    matrix_b = 0;

    // Fill A
    set_a(0,0,1);  set_a(0,1,2);  set_a(0,2,3);  set_a(0,3,4);
    set_a(1,0,5);  set_a(1,1,6);  set_a(1,2,7);  set_a(1,3,8);
    set_a(2,0,9);  set_a(2,1,10); set_a(2,2,11); set_a(2,3,12);
    set_a(3,0,13); set_a(3,1,14); set_a(3,2,15); set_a(3,3,16);

    // Fill B as identity
    set_b(0,0,1); set_b(1,1,1); set_b(2,2,1); set_b(3,3,1);

    // Trigger computation
    op_vld = 1;
    #10;
    op_vld = 0;

    // Wait for result (2 cycle latency)
    #30;

    $display("Test 1: A x Identity = A");
    $display("Row 0: %0d %0d %0d %0d (expect 1 2 3 4)",
        get_result(0), get_result(1), get_result(2), get_result(3));
    $display("Row 1: %0d %0d %0d %0d (expect 5 6 7 8)",
        get_result(4), get_result(5), get_result(6), get_result(7));
    $display("Row 2: %0d %0d %0d %0d (expect 9 10 11 12)",
        get_result(8), get_result(9), get_result(10), get_result(11));
    $display("Row 3: %0d %0d %0d %0d (expect 13 14 15 16)",
        get_result(12), get_result(13), get_result(14), get_result(15));

    // Test 2: Simple known result
    // A = all 2s, B = all 3s
    // Each output element = 2*3 + 2*3 + 2*3 + 2*3 = 24
    matrix_a = 0;
    matrix_b = 0;
    for (i = 0; i < 16; i = i + 1) begin
        matrix_a[i*8 +: 8] = 8'd2;
        matrix_b[i*8 +: 8] = 8'd3;
    end

    op_vld = 1;
    #10;
    op_vld = 0;
    #30;

    $display("\nTest 2: All-2s x All-3s (expect all 24)");
    $display("Row 0: %0d %0d %0d %0d",
        get_result(0), get_result(1), get_result(2), get_result(3));
    $display("Row 1: %0d %0d %0d %0d",
        get_result(4), get_result(5), get_result(6), get_result(7));

    #20;
    $finish;
end

endmodule
