"""
Run all tests
"""
import pytest
import sys

if __name__ == "__main__":
    exit_code = pytest.main(["-v", "tests/"])
    sys.exit(exit_code)

