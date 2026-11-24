# MI Product Rates Management System — Developer Documentation

Welcome to the comprehensive, step-by-step implementation guide for developing the **MI Product Rates Management System** for SLTMobitel.

> **Key Modification from Specification:**  
> This project has been customized to use **Oracle Database** instead of PostgreSQL, fully integrated with **Django ORM**, **Django REST Framework (DRF)**, and **React.js**.

---

## 📚 Documentation Index

| File | Title | Description |
| :--- | :--- | :--- |
| **[01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md)** | System Overview & Architecture | Tech stack, system flow diagram, directory structure, and prerequisites. |
| **[02_ORACLE_DB_SETUP.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/02_ORACLE_DB_SETUP.md)** | Oracle Database Setup & Configuration | Oracle DB user/schema creation, `oracledb` Python driver setup (Thin vs. Thick mode), and connection verification. |
| **[03_DJANGO_BACKEND_SETUP_AND_MODEL.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/03_DJANGO_BACKEND_SETUP_AND_MODEL.md)** | Task 01: Django Setup & ORM Model | Django project initialization, `SIA_MI_PRODUCT_RATES` model definition, auto-generating sequential `SR_ID` (`SR001`), and running migrations. |
| **[04_DRF_API_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/04_DRF_API_DEVELOPMENT.md)** | Task 02: REST API Development | Serializers, ModelViewSet, multipart/form-data upload handling, CORS configuration, and URL routing. |
| **[05_POSTMAN_API_TESTING_GUIDE.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/05_POSTMAN_API_TESTING_GUIDE.md)** | Task 03: Postman API Testing Guide | Complete test cases for all CRUD endpoints, file upload testing, and ready-to-import Postman Collection v2.1 JSON. |
| **[06_REACT_FRONTEND_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/06_REACT_FRONTEND_DEVELOPMENT.md)** | Tasks 04 & 05: React Frontend Development | Full React.js CRUD UI, table display, modal forms, decimal validation, file attachment preview/download, delete confirmation, and auto-refresh. |
| **[07_EXECUTION_AND_TROUBLESHOOTING_GUIDE.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/07_EXECUTION_AND_TROUBLESHOOTING_GUIDE.md)** | Execution & Troubleshooting Guide | How to start the servers simultaneously, verify deliverables, and resolve common Oracle/Django/CORS errors. |

---

## 🎯 Task Mapping Summary

- **Task 01 — Database Table Creation:** Documented in [02_ORACLE_DB_SETUP.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/02_ORACLE_DB_SETUP.md) & [03_DJANGO_BACKEND_SETUP_AND_MODEL.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/03_DJANGO_BACKEND_SETUP_AND_MODEL.md).
- **Task 02 — Backend API Development:** Documented in [04_DRF_API_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/04_DRF_API_DEVELOPMENT.md).
- **Task 03 — Postman API Testing Guide:** Documented in [05_POSTMAN_API_TESTING_GUIDE.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/05_POSTMAN_API_TESTING_GUIDE.md).
- **Task 04 — Frontend Development (React.js):** Documented in [06_REACT_FRONTEND_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/06_REACT_FRONTEND_DEVELOPMENT.md).
- **Task 05 — Functional Implementation:** Integrated across [03_DJANGO_BACKEND_SETUP_AND_MODEL.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/03_DJANGO_BACKEND_SETUP_AND_MODEL.md), [04_DRF_API_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/04_DRF_API_DEVELOPMENT.md), and [06_REACT_FRONTEND_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/06_REACT_FRONTEND_DEVELOPMENT.md).
