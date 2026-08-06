# Historical experiments

These files record the bring-up path that led to the final `dot4` design. They
are retained for engineering context, but they are not part of the supported
build or CI test suite.

- `bringup/` contains early RISC-V, matrix-multiplication, and UART programs.
- `legacy_testbenches/` contains exploratory testbenches for upstream modules
  that are not included in the current standalone test target.

The supported RTL test is the self-checking `test_dot4.v` at the repository
root. Run it with `make test`.
