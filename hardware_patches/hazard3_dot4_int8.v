/*
 * hazard3_dot4_int8.v
 * Custom INT8 4-way dot product unit for EdgeMind
 *
 * Computes: rd = a0*b0 + a1*b1 + a2*b2 + a3*b3
 * where rs1 = {a3,a2,a1,a0} and rs2 = {b3,b2,b1,b0}
 * each a_i, b_i is a signed 8-bit value.
 *
 * Single-cycle combinational result (like fast mul).
 */

`default_nettype none

module hazard3_dot4_int8 (
    input  wire [31:0] op_a,     // rs1: four packed INT8 values
    input  wire [31:0] op_b,     // rs2: four packed INT8 values
    output wire [31:0] result    // signed 32-bit dot product
);

// Extract the four signed INT8 lanes from each operand
wire signed [7:0] a0 = op_a[7:0];
wire signed [7:0] a1 = op_a[15:8];
wire signed [7:0] a2 = op_a[23:16];
wire signed [7:0] a3 = op_a[31:24];

wire signed [7:0] b0 = op_b[7:0];
wire signed [7:0] b1 = op_b[15:8];
wire signed [7:0] b2 = op_b[23:16];
wire signed [7:0] b3 = op_b[31:24];

// Four signed 8x8 products (each fits in 16 bits)
wire signed [15:0] p0 = a0 * b0;
wire signed [15:0] p1 = a1 * b1;
wire signed [15:0] p2 = a2 * b2;
wire signed [15:0] p3 = a3 * b3;

// Sum the four products into a 32-bit signed result
wire signed [31:0] sum = p0 + p1 + p2 + p3;

assign result = sum;

endmodule

`ifndef YOSYS
`default_nettype wire
`endif

