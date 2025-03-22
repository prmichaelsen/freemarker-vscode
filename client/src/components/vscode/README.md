`vscode` is not accessible in a unit test environment.

This module defines abstractions for `vscode` implementations
and utility functions to convert those abstractions to
their corresponding `vscode` implementation.

This enables testing of utility functions that would
otherwise depend on the `vscode` implementations.