import sys
import oracledb

# Compatibility shim for Django Oracle backend using python-oracledb
oracledb.version = "8.3.0"
sys.modules["cx_Oracle"] = oracledb
