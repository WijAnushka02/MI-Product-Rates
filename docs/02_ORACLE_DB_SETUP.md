# Document 02: Oracle Database Setup & Configuration

This guide details the setup and configuration of **Oracle Database** to replace PostgreSQL for the MI Product Rates application.

---

## 1. Overview: Oracle Database with Django

In modern enterprise Python and Django architectures, the official database driver is **`python-oracledb`** (which replaced the legacy `cx_Oracle` library).

### Thin Mode vs. Thick Mode

| Mode | Requirements | Supported Oracle DB | Recommended? |
| :--- | :--- | :--- | :--- |
| **Thin Mode (Default)** | Pure Python, **zero** Oracle Instant Client binaries needed. | Oracle 12.1, 18c, 19c, 21c, 23ai | **Yes (Simplest on Windows)** |
| **Thick Mode** | Requires Oracle Instant Client `.dll` / `.so` libraries installed on your PATH. | Oracle 11.2 and above, or advanced security (Kerberos, RADIUS) | Only if using legacy Oracle 11g |

> [!TIP]
> Use **Thin Mode**. You do not need to download or install the Oracle Instant Client C binaries if your Oracle database is 12c or newer.

---

## 2. Oracle Schema & User Creation

Open your SQL client (**SQL*Plus**, **Oracle SQL Developer**, or **DBeaver**) and log in as `SYSTEM` or `SYS AS SYSDBA`.

### If using Pluggable Databases (PDB) (Oracle 12c, 19c, 21c, 23ai, Oracle XE)
In modern Oracle installations, application schemas reside inside a Pluggable Database (e.g., `XEPDB1`, `ORCLPDB`, or `FREEPDB1`).

Execute the following SQL script:

```sql
-- 1. Switch session to the application pluggable database (PDB)
-- (Replace XEPDB1 with your specific PDB name if different, e.g. FREEPDB1 or ORCLPDB)
ALTER SESSION SET CONTAINER = XEPDB1;

-- 2. Create the application user/schema
CREATE USER mi_admin IDENTIFIED BY "Password123#"
DEFAULT TABLESPACE USERS
TEMPORARY TABLESPACE TEMP
QUOTA UNLIMITED ON USERS;

-- 3. Grant necessary privileges for Django ORM operations
GRANT CONNECT, RESOURCE TO mi_admin;
GRANT CREATE SESSION TO mi_admin;
GRANT CREATE TABLE TO mi_admin;
GRANT CREATE VIEW TO mi_admin;
GRANT CREATE SEQUENCE TO mi_admin;
GRANT CREATE TRIGGER TO mi_admin;
GRANT CREATE PROCEDURE TO mi_admin;
GRANT UNLIMITED TABLESPACE TO mi_admin;

-- 4. Commit changes
COMMIT;
```

> [!NOTE]
> If you are working on a non-CDB / standalone database, you do not need the `ALTER SESSION SET CONTAINER` line.

---

## 3. Python Driver Installation

In your Python virtual environment (which we will initialize in the backend folder):

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install python-oracledb
pip install oracledb

# Install Django and DRF
pip install django djangorestframework django-cors-headers pillow
```

---

## 4. Enabling `oracledb` in Django

Django 4.2+ and Django 5.x support `oracledb` natively. To ensure backwards and cross-version compatibility with `django.db.backends.oracle`, add the compatibility shim in the Django project's root initialization file:

Create/edit `backend/mi_rates_backend/__init__.py`:

```python
import sys
import oracledb

# Emulate cx_Oracle for older Django engines if necessary
oracledb.version = "8.3.0"
sys.modules["cx_Oracle"] = oracledb

# Thin mode is default (no Instant Client needed).
# If you ever require Thick Mode for Oracle 11g, uncomment the line below:
# oracledb.init_oracle_client(lib_dir=r"C:\oracle\instantclient_19_19")
```

---

## 5. Configuring `DATABASES` in `settings.py`

In your Django `settings.py`, configure the `DATABASES` dictionary as follows:

```python
# backend/mi_rates_backend/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'localhost:1521/XEPDB1',  # Format: host:port/service_name
        'USER': 'mi_admin',
        'PASSWORD': 'Password123#',
        'OPTIONS': {
            'threaded': True,
        },
    }
}
```

### Alternative: Using TNS or Host / Port Parameters

If you prefer separate keys instead of the Easy Connect naming convention:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'XEPDB1',         # Oracle Service Name
        'USER': 'mi_admin',
        'PASSWORD': 'Password123#',
        'HOST': 'localhost',       # Oracle Server Host
        'PORT': '1521',            # Oracle Port
    }
}
```

---

## 6. Oracle Database Connection Verification Script

Before running any Django migrations, create a small Python script to verify that your connection to Oracle is working properly.

Create a temporary script `test_oracle_conn.py`:

```python
# test_oracle_conn.py
import oracledb

# Connection parameters
USER = "mi_admin"
PASSWORD = "Password123#"
DSN = "localhost:1521/XEPDB1"

print(f"Connecting to Oracle Database at {DSN} as {USER}...")

try:
    with oracledb.connect(user=USER, password=PASSWORD, dsn=DSN) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT banner FROM v$version WHERE ROWNUM = 1")
            version = cursor.fetchone()
            print(" Connected successfully to Oracle Database!")
            print(f"Database Version: {version[0]}")
            
            # Check user session
            cursor.execute("SELECT USER, SYS_CONTEXT('USERENV', 'CON_NAME') FROM dual")
            user_info = cursor.fetchone()
            print(f"Connected User: {user_info[0]} | Container: {user_info[1]}")
except Exception as e:
    print(" Connection failed!")
    print(f"Error details: {e}")
```

Run the script:
```bash
python test_oracle_conn.py
```

Expected Output:
```text
Connecting to Oracle Database at localhost:1521/XEPDB1 as mi_admin...
 Connected successfully to Oracle Database!
Database Version: Oracle Database 21c Express Edition Release 21.0.0.0.0 - Production
Connected User: MI_ADMIN | Container: XEPDB1
```

Once this test succeeds, proceed to **[03_DJANGO_BACKEND_SETUP_AND_MODEL.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/03_DJANGO_BACKEND_SETUP_AND_MODEL.md)** to implement the Django ORM model and migrations.
