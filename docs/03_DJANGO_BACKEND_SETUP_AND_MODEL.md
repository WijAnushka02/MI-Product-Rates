# Document 03: Task 01 — Django Backend Setup & ORM Model

This document covers **Task 01: Database Table Creation** using Django ORM and Oracle Database.

---

## 1. Initializing the Django Backend Project

Execute the following commands in your terminal to set up the backend environment:

```bash
# Navigate to the workspace root
cd "d:\Anushka_1\HIGHER EDUCATION\Degree Level_(BSc(Hon's))_Software Engineering\UoK\ACADEMIC\Year 3\Semester 6\SLTMobitel Intern\MI Product Rates"

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Or on Command Prompt (CMD):
.\venv\Scripts\activate.bat

# Install required packages
pip install django djangorestframework django-cors-headers oracledb pillow

# Create backend directory and Django project
mkdir backend
cd backend
django-admin startproject mi_rates_backend .

# Create the rates Django application
python manage.py startapp rates
```

---

## 2. Requirements File (`requirements.txt`)

Save the exact dependencies inside `backend/requirements.txt`:

```text
Django>=5.0,<6.0
djangorestframework>=3.14.0
django-cors-headers>=4.3.0
oracledb>=2.0.0
pillow>=10.0.0
```

---

## 3. Configuring `settings.py`

Update `backend/mi_rates_backend/settings.py` to register installed apps, middleware, Oracle database settings, and media storage configurations:

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-sltmobitel-mi-product-rates-key-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-Party Apps
    'rest_framework',
    'corsheaders',
    
    # Local Apps
    'rates.apps.RatesConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Must be at the very top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'mi_rates_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'mi_rates_backend.wsgi.application'

# -------------------------------------------------------------
# DATABASE CONFIGURATION: ORACLE DATABASE
# -------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'localhost:1521/XEPDB1',  # Update host:port/service_name to your Oracle instance
        'USER': 'mi_admin',
        'PASSWORD': 'Password123#',
        'OPTIONS': {
            'threaded': True,
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Colombo' # SLTMobitel timezone
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# -------------------------------------------------------------
# MEDIA FILES (FILE UPLOADS FOR ATTACHMENTS)
# -------------------------------------------------------------
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -------------------------------------------------------------
# CORS CONFIGURATION (ALLOW REACT CLIENT)
# -------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True # For development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
]
```

Add the driver compatibility in `backend/mi_rates_backend/__init__.py`:

```python
import sys
import oracledb

# Allow Django oracle backend to seamlessly utilize python-oracledb
oracledb.version = "8.3.0"
sys.modules["cx_Oracle"] = oracledb
```

---

## 4. Defining the Django ORM Model (`SIA_MI_PRODUCT_RATES`)

The requirement mandates creating the table `SIA_MI_PRODUCT_RATES` strictly through Django ORM without manual SQL scripts.

Open `backend/rates/models.py` and write the complete model:

```python
# backend/rates/models.py

import os
import re
from django.db import models, transaction
from django.core.validators import MinValueValidator
from decimal import Decimal


def attachment_upload_path(instance, filename):
    """
    Generate an organized file path for uploaded attachments:
    e.g., media/attachments/SR001/filename.pdf
    """
    folder = instance.sr_id if instance.sr_id else "temp"
    return os.path.join("attachments", folder, filename)


class MiProductRate(models.Model):
    """
    Model representing the SIA_MI_PRODUCT_RATES table in Oracle Database.
    Stores telecommunication MI product rates, executive tiers, audit logs,
    and supporting documentation.
    """
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    # Primary Key
    id = models.AutoField(
        primary_key=True,
        db_column='ID',
        help_text="Unique auto-incrementing identifier"
    )

    # Unique, Auto Generated (e.g., SR001, SR002)
    sr_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        db_column='SR_ID',
        help_text="Auto-generated sequential Service Rate ID (e.g., SR001)"
    )

    # Service Name
    service = models.CharField(
        max_length=150,
        db_column='SERVICE',
        help_text="Telecommunication service name (e.g., Dedicated Internet, Cloud Hosting)"
    )

    # Executive Level Name
    executive_level = models.CharField(
        max_length=100,
        db_column='EXECUTIVE_LEVEL',
        help_text="Applicable executive tier (e.g., Bronze, Silver, Gold, Enterprise)"
    )

    # Rate: DecimalField (max_digits=12, decimal_places=2)
    rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        db_column='RATE',
        help_text="Product rate in standard currency format (up to 12 digits, 2 decimal places)"
    )

    # Audit Trail: Created
    created_date = models.DateTimeField(
        auto_now_add=True,
        db_column='CREATED_DATE',
        help_text="Timestamp when the record was created"
    )
    created_user = models.CharField(
        max_length=100,
        db_column='CREATED_USER',
        help_text="Username of the creator"
    )

    # Audit Trail: Updated
    updated_date = models.DateTimeField(
        auto_now=True,
        db_column='UPDATED_DATE',
        help_text="Timestamp when the record was last modified"
    )
    updated_user = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_column='UPDATED_USER',
        help_text="Username of the last updater (nullable)"
    )

    # Status: Active / Inactive
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active',
        db_column='STATUS',
        help_text="Operational status (Active or Inactive)"
    )

    # Optional File Upload
    attachment = models.FileField(
        upload_to=attachment_upload_path,
        null=True,
        blank=True,
        db_column='ATTACHMENT',
        help_text="Optional supporting document / rate card (PDF, DOCX, PNG, etc.)"
    )

    # Optional Comments
    comments = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        db_column='COMMENTS',
        help_text="Optional remarks or notes"
    )

    class Meta:
        db_table = 'SIA_MI_PRODUCT_RATES'
        verbose_name = 'MI Product Rate'
        verbose_name_plural = 'MI Product Rates'
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.sr_id} - {self.service} ({self.executive_level}): {self.rate}"

    @classmethod
    def generate_next_sr_id(cls):
        """
        Calculates the next sequential SR_ID (e.g., SR001 -> SR002).
        Safely scans existing records for highest integer suffix.
        """
        with transaction.atomic():
            records = cls.objects.filter(sr_id__startswith='SR').values_list('sr_id', flat=True)
            max_num = 0
            for sr in records:
                match = re.search(r'SR(\d+)', sr)
                if match:
                    val = int(match.group(1))
                    if val > max_num:
                        max_num = val
            next_num = max_num + 1
            return f"SR{next_num:03d}"

    def save(self, *args, **kwargs):
        """
        Overridden save method to automatically assign SR_ID if not provided.
        """
        if not self.sr_id:
            self.sr_id = self.generate_next_sr_id()
        super().save(*args, **kwargs)
```

---

## 5. Registering in Django Admin (`rates/admin.py`)

To inspect and manage records via Django's built-in administration dashboard:

```python
# backend/rates/admin.py

from django.contrib import admin
from .models import MiProductRate

@admin.register(MiProductRate)
class MiProductRateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'sr_id',
        'service',
        'executive_level',
        'rate',
        'status',
        'created_user',
        'created_date',
        'attachment_link'
    )
    list_filter = ('status', 'executive_level', 'created_date')
    search_fields = ('sr_id', 'service', 'executive_level', 'created_user', 'comments')
    readonly_fields = ('id', 'sr_id', 'created_date', 'updated_date')
    ordering = ('-id',)

    def attachment_link(self, obj):
        if obj.attachment:
            return obj.attachment.name
        return "No Attachment"
    attachment_link.short_description = "Attachment"
```

---

## 6. Running Migrations Against Oracle Database

Once the model is written, execute the migration commands:

### Step 1: Create the migration file
```bash
python manage.py makemigrations rates
```

Output:
```text
Migrations for 'rates':
  rates/migrations/0001_initial.py
    - Create model MiProductRate
```

### Step 2: (Optional Verification) Inspect the Oracle SQL generated by Django ORM
Run `sqlmigrate` to verify the exact Oracle DDL syntax generated:
```bash
python manage.py sqlmigrate rates 0001
```

You will see the valid Oracle DDL generated automatically:
```sql
CREATE TABLE "SIA_MI_PRODUCT_RATES" (
    "ID" NUMBER(11) GENERATED BY DEFAULT ON NULL AS IDENTITY NOT NULL PRIMARY KEY,
    "SR_ID" VARCHAR2(20) NOT NULL UNIQUE,
    "SERVICE" VARCHAR2(150) NOT NULL,
    "EXECUTIVE_LEVEL" VARCHAR2(100) NOT NULL,
    "RATE" NUMBER(12, 2) NOT NULL,
    "CREATED_DATE" TIMESTAMP NOT NULL,
    "CREATED_USER" VARCHAR2(100) NOT NULL,
    "UPDATED_DATE" TIMESTAMP NOT NULL,
    "UPDATED_USER" VARCHAR2(100) NULL,
    "STATUS" VARCHAR2(20) NOT NULL,
    "ATTACHMENT" VARCHAR2(100) NULL,
    "COMMENTS" VARCHAR2(500) NULL
);
```
*(Notice how Django translates AutoField into Oracle's `GENERATED BY DEFAULT ON NULL AS IDENTITY`, DecimalField to `NUMBER(12, 2)`, and DateTimeField to `TIMESTAMP`)*.

### Step 3: Apply the migration to Oracle Database
```bash
python manage.py migrate
```

Output:
```text
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, rates, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
  Applying rates.0001_initial... OK
```

The `SIA_MI_PRODUCT_RATES` table is now live in Oracle Database! Next, proceed to **[04_DRF_API_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/04_DRF_API_DEVELOPMENT.md)** to build the REST API endpoints.
