`timescale 1ns/1ps

module test_dot4;

reg [31:0] op_a;
reg [31:0] op_b;
wire [31:0] result;
integer failures = 0;

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

task check;
    input [31:0] a;
    input [31:0] b;
    input signed [31:0] expected;
    input [127:0] label;
    begin
        op_a = a;
        op_b = b;
        #1;
        if ($signed(result) !== expected) begin
            $error("%0s: got %0d, expected %0d", label, $signed(result), expected);
            failures = failures + 1;
        end
    end
endtask

initial begin
    check(pack(4, 3, 2, 1), pack(1, 1, 1, 1), 10, "basic");
    check(pack(2, 2, 2, 2), pack(3, 3, 3, 3), 24, "uniform");
    check(pack(-1, -2, 3, 4), pack(1, 1, 1, 1), 4, "negative lanes");
    check(pack(127, 127, 127, 127), pack(127, 127, 127, 127), 64516, "max positive");
    check(pack(-128, -128, -128, -128), pack(-128, -128, -128, -128), 65536, "max magnitude");
    check(pack(-5, 10, -3, 7), pack(2, -4, 6, -8), -124, "mixed signs");

    if (failures != 0)
        $fatal(1, "dot4: %0d test(s) failed", failures);

    $display("dot4: all tests passed");
    $finish(0);
end

endmodule
