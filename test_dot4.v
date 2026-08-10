`timescale 1ns/1ps

module test_dot4;

reg [31:0] op_a;
reg [31:0] op_b;
wire [31:0] result;
integer failures = 0;
integer vector_file;
integer vector_index;
integer scan_count;
integer random_tests;
reg [31:0] vector_a;
reg [31:0] vector_b;
reg signed [31:0] vector_expected;
string vector_path;

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

    if (!$value$plusargs("VECTORS=%s", vector_path))
        $fatal(1, "dot4: missing +VECTORS=<path>");

    vector_file = $fopen(vector_path, "r");
    if (vector_file == 0)
        $fatal(1, "dot4: could not open vector file %0s", vector_path);

    vector_index = 0;
    random_tests = 0;
    while (!$feof(vector_file)) begin
        scan_count = $fscanf(
            vector_file, "%h %h %d\n", vector_a, vector_b, vector_expected
        );
        if (scan_count == 3) begin
            op_a = vector_a;
            op_b = vector_b;
            #1;
            if ($signed(result) !== vector_expected) begin
                $error(
                    "random vector %0d: a=%08x b=%08x got=%0d expected=%0d",
                    vector_index, vector_a, vector_b,
                    $signed(result), vector_expected
                );
                failures = failures + 1;
            end
            vector_index = vector_index + 1;
            random_tests = random_tests + 1;
        end else if (scan_count != -1) begin
            $fatal(1, "dot4: malformed vector at index %0d", vector_index);
        end
    end
    $fclose(vector_file);

    if (failures != 0)
        $fatal(1, "dot4: %0d test(s) failed", failures);

    $display(
        "dot4: 6 directed and %0d deterministic random tests passed",
        random_tests
    );
    $finish(0);
end

endmodule
