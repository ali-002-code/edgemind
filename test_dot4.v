`timescale 1ns/1ps

module test_dot4;

reg [31:0] op_a;
reg [31:0] op_b;
wire [31:0] result;

hazard3_dot4_int8 dut (
    .op_a(op_a),
    .op_b(op_b),
    .result(result)
);

// Helper to pack four signed bytes into a 32-bit word
function [31:0] pack;
    input signed [7:0] x3, x2, x1, x0;
    begin
        pack = {x3[7:0], x2[7:0], x1[7:0], x0[7:0]};
    end
endfunction

initial begin
    // Test 1: [1,2,3,4] . [1,1,1,1] = 1+2+3+4 = 10
    op_a = pack(4, 3, 2, 1);
    op_b = pack(1, 1, 1, 1);
    #10;
    $display("Test 1: [1,2,3,4].[1,1,1,1] = %0d (expect 10)", $signed(result));

    // Test 2: [2,2,2,2] . [3,3,3,3] = 6*4 = 24
    op_a = pack(2, 2, 2, 2);
    op_b = pack(3, 3, 3, 3);
    #10;
    $display("Test 2: [2,2,2,2].[3,3,3,3] = %0d (expect 24)", $signed(result));

    // Test 3: negative values [-1,-2,3,4] . [1,1,1,1] = -1-2+3+4 = 4
    op_a = pack(-1, -2, 3, 4);
    op_b = pack(1, 1, 1, 1);
    #10;
    $display("Test 3: [-1,-2,3,4].[1,1,1,1] = %0d (expect 4)", $signed(result));

    // Test 4: max values [127,127,127,127] . [127,127,127,127]
    // = 4 * (127*127) = 4 * 16129 = 64516
    op_a = pack(127, 127, 127, 127);
    op_b = pack(127, 127, 127, 127);
    #10;
    $display("Test 4: max positive = %0d (expect 64516)", $signed(result));

    // Test 5: mixed signs [-5,10,-3,7] . [2,-4,6,-8]
    // = -10 -40 -18 -56 = -124
    op_a = pack(-5, 10, -3, 7);
    op_b = pack(2, -4, 6, -8);
    #10;
    $display("Test 5: mixed = %0d (expect -124)", $signed(result));

    $finish;
end

endmodule
