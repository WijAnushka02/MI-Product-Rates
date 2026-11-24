# Document 07: Execution & Troubleshooting Guide

This guide provides end-to-end instructions for running both backend and frontend applications concurrently, along with solutions to common Oracle Database and Django errors.

---

## 1. Quick Start Execution Guide

### Terminal 1: Backend (Django & Oracle DB)

```bash
# 1. Open Terminal and navigate to the project directory
cd "d:\Anushka_1\HIGHER EDUCATION\Degree Level_(BSc(Hon's))_Software Engineering\UoK\ACADEMIC\Year 3\Semester 6\SLTMobitel Intern\MI Product Rates"

# 2. Activate Python virtual environment
.\venv\Scripts\Activate.ps1

# 3. Navigate to backend
cd backend

# 4. Run database migrations to ensure table SIA_MI_PRODUCT_RATES exists in Oracle
python manage.py makemigrations rates
python manage.py migrate

# 5. (Optional) Create Django superuser for Admin Panel
python manage.py createsuperuser

# 6. Start Django REST API server
python manage.py runserver 8000
```
Backend API will be running at `http://localhost:8000/`.

---

### Terminal 2: Frontend (React.js + Vite)

```bash
# 1. Open a second Terminal window
cd "d:\Anushka_1\HIGHER EDUCATION\Degree Level_(BSc(Hon's))_Software Engineering\UoK\ACADEMIC\Year 3\Semester 6\SLTMobitel Intern\MI Product Rates\frontend"

# 2. Install npm dependencies (if not done yet)
npm install

# 3. Launch Vite development server
npm run dev
```
Frontend Web UI will be running at `http://localhost:5173/`.

---

## 2. Deliverables Verification Checklist

Use this checklist to ensure all project requirements from the task specification are satisfied:

| Deliverable | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Oracle Database Table** | Table `SIA_MI_PRODUCT_RATES` created strictly via Django ORM (no manual SQL). | Run `python manage.py sqlmigrate rates 0001` to view generated Oracle DDL. Query table in Oracle SQL Developer: `SELECT * FROM SIA_MI_PRODUCT_RATES;` | Verified |
| **SR_ID Auto-Generation** | Automatically generate `SR001`, `SR002`, etc. sequentially. | Create records via Postman or React UI. Check `SR_ID` increments properly. | Verified |
| **Backend REST APIs** | Full CRUD endpoints under `/api/mi-product-rates/` with multipart file upload support. | Test with Postman Collection or navigate to `http://localhost:8000/api/mi-product-rates/`. | Verified |
| **Decimal Validation** | Validate rate input (positive, max 12 digits, 2 decimal places). | Attempt saving invalid rates (e.g. `120.999` or `-50`) in UI/API; verify validation error. | Verified |
| **React Frontend** | Professional, responsive UI with table, modal form, delete confirmation, file link, and toast alerts. | Open `http://localhost:5173/`, add, edit, view attachment, and delete records. | Verified |
| **Auto-Refresh** | Table refreshes automatically after Create, Update, and Delete. | Observe table updating instantly without needing a browser reload. | Verified |
| **Postman Testing** | Comprehensive collection covering all scenarios and test scripts. | Import `postman/MI_Product_Rates_API.postman_collection.json` into Postman and run collection runner. | Verified |

---

## 3. Common Troubleshooting & FAQs

### A. Oracle Database Errors

#### 1. `ORA-12514: TNS:listener does not currently know of service requested in connect descriptor`
- **Cause:** The Oracle Service Name specified in `settings.py` (e.g., `XEPDB1`) is incorrect or the database is not registered with the listener.
- **Solution:**
  1. Open a terminal and run `lsnrctl status` to see registered service names.
  2. Verify your pluggable database name. If using Oracle 21c/XE, it is typically `XEPDB1`. If Oracle 23ai Free, it is `FREEPDB1`.
  3. Update `DATABASES['default']['NAME']` in `backend/mi_rates_backend/settings.py` accordingly.

#### 2. `ORA-01017: invalid username/password; logon denied`
- **Cause:** Incorrect Oracle username or password.
- **Solution:**
  1. Log into SQL*Plus as SYSDBA:
     ```sql
     sqlplus sys/your_admin_password@localhost:1521/XEPDB1 as sysdba
     ```
  2. Reset user password:
     ```sql
     ALTER USER mi_admin IDENTIFIED BY "Password123#";
     ```

#### 3. `DPI-1047: Cannot locate a 64-bit Oracle Client library`
- **Cause:** Happens when python-oracledb is forced into "Thick Mode" without Oracle Instant Client binaries on the PATH.
- **Solution:**
  - `python-oracledb` runs in **Thin Mode** by default and does **not** need Instant Client. Ensure you did not call `oracledb.init_oracle_client()` with an invalid path. Thin mode connects directly using pure Python.

---

### B. Django Backend & File Upload Errors

#### 1. `413 Request Entity Too Large` or File Upload Failure
- **Cause:** File size exceeds allowable limits or parser classes are missing.
- **Solution:**
  - Ensure `parser_classes = (MultiPartParser, FormParser, JSONParser)` is present in `backend/rates/views.py`.
  - In `settings.py`, configure maximum upload size if needed:
    ```python
    DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760 # 10MB
    FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760 # 10MB
    ```

#### 2. `404 Not Found` when clicking attachment links in the browser
- **Cause:** Django development server is not configured to serve `/media/` files.
- **Solution:**
  - Verify that `backend/mi_rates_backend/urls.py` contains:
    ```python
    from django.conf import settings
    from django.conf.urls.static import static

    if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    ```

---

### C. Frontend / CORS Errors

#### 1. `Access to XMLHttpRequest at 'http://localhost:8000/api/...' has been blocked by CORS policy`
- **Cause:** `django-cors-headers` is missing or improperly positioned in `MIDDLEWARE`.
- **Solution:**
  - Verify `'corsheaders.middleware.CorsMiddleware'` is at the **very top** of `MIDDLEWARE` in `settings.py`.
  - Ensure `CORS_ALLOW_ALL_ORIGINS = True` or `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`.

#### 2. Port `8000` or `5173` is already in use
- **Solution:**
  - Run Django on a different port: `python manage.py runserver 8080` (update `frontend/src/services/api.js` BASE_URL to `8080`).
  - Run Vite on a different port: `npm run dev -- --port 3000`.
