# Document 04: Task 02 — REST API Development with DRF

This document covers **Task 02: Backend API Development** using Django REST Framework (DRF), including file upload handling, serializer validation, and CRUD endpoints.

---

## 1. Overview of Endpoints

The API conforms to standard REST conventions:

| Method | Endpoint | Description | Payload Type |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/mi-product-rates/` | Create a new MI rate record (with auto `SR_ID`) | `multipart/form-data` or `application/json` |
| **GET** | `/api/mi-product-rates/` | List all records (supports search & filter) | None |
| **GET** | `/api/mi-product-rates/<id>/` | Retrieve a single record by primary key `ID` | None |
| **PUT** | `/api/mi-product-rates/<id>/` | Replace all fields of an existing record | `multipart/form-data` or `application/json` |
| **PATCH** | `/api/mi-product-rates/<id>/` | Partially update fields of an existing record | `multipart/form-data` or `application/json` |
| **DELETE**| `/api/mi-product-rates/<id>/` | Delete an existing record | None |

---

## 2. DRF Serializer with Validation (`rates/serializers.py`)

Create `backend/rates/serializers.py`. This serializer provides:
1. Automatic calculation of full `attachment_url`.
2. Strict decimal validation for `rate` (must be positive, max 2 decimal places).
3. Validation of allowed file extensions and file size limit (10MB).
4. `id`, `sr_id`, `created_date`, and `updated_date` are strictly read-only.

```python
# backend/rates/serializers.py

import os
from decimal import Decimal, InvalidOperation
from rest_framework import serializers
from .models import MiProductRate

ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg']
MAX_FILE_SIZE_MB = 10  # 10 Megabytes


class MiProductRateSerializer(serializers.ModelSerializer):
    """
    Serializer for the MiProductRate model.
    Handles data validation, serialization, and file URL formatting.
    """
    attachment_url = serializers.SerializerMethodField(read_only=True)
    rate = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = MiProductRate
        fields = [
            'id',
            'sr_id',
            'service',
            'executive_level',
            'rate',
            'created_date',
            'created_user',
            'updated_date',
            'updated_user',
            'status',
            'attachment',
            'attachment_url',
            'comments',
        ]
        read_only_fields = [
            'id',
            'sr_id',
            'created_date',
            'updated_date',
        ]

    def get_attachment_url(self, obj):
        """
        Builds the absolute URL for the uploaded file so frontend can display/download it.
        """
        request = self.context.get('request')
        if obj.attachment:
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None

    def validate_rate(self, value):
        """
        Validates that rate is greater than or equal to 0.00 and has at most 2 decimal places.
        """
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Rate cannot be negative.")
        
        # Check decimal places
        exponent = abs(value.as_tuple().exponent)
        if exponent > 2:
            raise serializers.ValidationError("Rate cannot have more than 2 decimal places.")
        return value

    def validate_service(self, value):
        """
        Ensure service name is not just whitespace.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Service name is required and cannot be blank.")
        return value.strip()

    def validate_executive_level(self, value):
        """
        Ensure executive level is not blank.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Executive Level is required and cannot be blank.")
        return value.strip()

    def validate_status(self, value):
        """
        Ensure status is either Active or Inactive.
        """
        if value not in ['Active', 'Inactive']:
            raise serializers.ValidationError("Status must be either 'Active' or 'Inactive'.")
        return value

    def validate_attachment(self, file_obj):
        """
        Validates file size and allowed extension for file upload security.
        """
        if file_obj:
            # Check file size
            if file_obj.size > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise serializers.ValidationError(f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_MB}MB.")
            
            # Check extension
            ext = os.path.splitext(file_obj.name)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise serializers.ValidationError(
                    f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
                )
        return file_obj

    def create(self, validated_data):
        """
        Override create to auto-generate SR_ID before persistence.
        """
        if 'sr_id' not in validated_data or not validated_data['sr_id']:
            validated_data['sr_id'] = MiProductRate.generate_next_sr_id()
        return super().create(validated_data)
```

---

## 3. DRF ViewSet Implementation (`rates/views.py`)

Create `backend/rates/views.py`. We use `ModelViewSet` combined with `MultiPartParser`, `FormParser`, and `JSONParser` to handle both file attachments and standard form submissions:

```python
# backend/rates/views.py

from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import MiProductRate
from .serializers import MiProductRateSerializer


class MiProductRateViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides full CRUD actions for MI Product Rates:
    - list (GET /api/mi-product-rates/)
    - retrieve (GET /api/mi-product-rates/<id>/)
    - create (POST /api/mi-product-rates/)
    - update (PUT /api/mi-product-rates/<id>/)
    - partial_update (PATCH /api/mi-product-rates/<id>/)
    - destroy (DELETE /api/mi-product-rates/<id>/)
    """
    queryset = MiProductRate.objects.all().order_by('-id')
    serializer_class = MiProductRateSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sr_id', 'service', 'executive_level', 'created_user', 'status']
    ordering_fields = ['id', 'sr_id', 'rate', 'created_date', 'status']

    def perform_create(self, serializer):
        """
        Assign default created_user if not supplied in the request.
        """
        created_user = self.request.data.get('created_user') or 'System Admin'
        serializer.save(created_user=created_user)

    def perform_update(self, serializer):
        """
        Assign updated_user timestamp and user when record is modified.
        """
        updated_user = self.request.data.get('updated_user') or 'System Admin'
        serializer.save(updated_user=updated_user)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes the record and removes any physical attachment file associated with it.
        """
        instance = self.get_object()
        
        # Clean up attachment file from storage if present
        if instance.attachment:
            instance.attachment.delete(save=False)
            
        self.perform_destroy(instance)
        return Response(
            {"message": f"Product rate record {instance.sr_id} successfully deleted."},
            status=status.HTTP_200_OK
        )
```

---

## 4. URL Routing Configuration

### 1. App-level URLs (`rates/urls.py`)
Create `backend/rates/urls.py`:

```python
# backend/rates/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MiProductRateViewSet

router = DefaultRouter()
router.register(r'mi-product-rates', MiProductRateViewSet, basename='mi-product-rate')

urlpatterns = [
    path('', include(router.urls)),
]
```

### 2. Project-level URLs (`mi_rates_backend/urls.py`)
Update `backend/mi_rates_backend/urls.py` to route `/api/` and serve uploaded `/media/` files during development:

```python
# backend/mi_rates_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('rates.urls')),
]

# Enable serving of user-uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 5. Testing the Backend Locally

Run the development server:

```bash
python manage.py runserver 8000
```

Visit in your web browser:
- API Root: `http://localhost:8000/api/mi-product-rates/`
- Django Admin: `http://localhost:8000/admin/`

You are now ready to verify the endpoints using Postman in **[05_POSTMAN_API_TESTING_GUIDE.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/05_POSTMAN_API_TESTING_GUIDE.md)**.
