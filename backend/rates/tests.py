import os
import tempfile
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from rates.models import MiProductRate
from rates.serializers import MiProductRateSerializer


# =====================================================================
# 1. UNIT TESTS: MODEL LEVEL & SR_ID GENERATOR
# =====================================================================

class MiProductRateModelUnitTests(TestCase):
    """
    Unit tests for model instantiation, SR_ID sequence generation,
    and field representation.
    """

    def test_sr_id_auto_generation_sequence(self):
        """Verify that sequential SR_IDs are auto-generated: SR001, SR002..."""
        rate1 = MiProductRate.objects.create(
            service="Dedicated Internet Access",
            executive_level="Enterprise Gold",
            rate=Decimal("125000.00"),
            created_user="anushka_intern",
            status="Active"
        )
        self.assertTrue(rate1.sr_id.startswith("SR"))

        rate2 = MiProductRate.objects.create(
            service="MPLS VPN Link",
            executive_level="Silver Tier",
            rate=Decimal("78000.00"),
            created_user="anushka_intern",
            status="Active"
        )
        self.assertTrue(rate2.sr_id.startswith("SR"))
        self.assertNotEqual(rate1.sr_id, rate2.sr_id)

    def test_model_string_representation(self):
        """Verify string format: '{sr_id} - {service} ({executive_level}): {rate}'"""
        rate = MiProductRate.objects.create(
            service="Cloud Connect",
            executive_level="Platinum",
            rate=Decimal("200000.00"),
            created_user="cloud_admin"
        )
        expected_str = f"{rate.sr_id} - Cloud Connect (Platinum): 200000.00"
        self.assertEqual(str(rate), expected_str)

    def test_default_status_is_active(self):
        """Verify default status is 'Active'"""
        rate = MiProductRate.objects.create(
            service="Metro Ethernet",
            executive_level="Bronze",
            rate=Decimal("45000.00"),
            created_user="sales"
        )
        self.assertEqual(rate.status, "Active")


# =====================================================================
# 2. UNIT TESTS: SERIALIZER & DATA VALIDATION
# =====================================================================

class MiProductRateSerializerValidationTests(TestCase):
    """
    Unit tests verifying serializer validation constraints.
    """

    def test_negative_rate_rejected(self):
        """Rates cannot be negative"""
        payload = {
            "service": "SIP Trunk",
            "executive_level": "Gold",
            "rate": "-500.00",
            "created_user": "tester",
            "status": "Active"
        }
        serializer = MiProductRateSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("rate", serializer.errors)

    def test_more_than_two_decimal_places_rejected(self):
        """Rates with more than 2 decimal places must be rejected"""
        payload = {
            "service": "SIP Trunk",
            "executive_level": "Gold",
            "rate": "12500.555",
            "created_user": "tester",
            "status": "Active"
        }
        serializer = MiProductRateSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("rate", serializer.errors)

    def test_empty_service_rejected(self):
        """Blank or whitespace-only service names must be rejected"""
        payload = {
            "service": "   ",
            "executive_level": "Gold",
            "rate": "5000.00",
            "created_user": "tester",
            "status": "Active"
        }
        serializer = MiProductRateSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("service", serializer.errors)

    def test_unsupported_file_extension_rejected(self):
        """Executable or dangerous extensions (.exe, .sh) must be rejected"""
        fake_file = SimpleUploadedFile("malicious.exe", b"binary content", content_type="application/octet-stream")
        payload = {
            "service": "Firewall Rule",
            "executive_level": "Gold",
            "rate": "15000.00",
            "created_user": "security_auditor",
            "status": "Active",
            "attachment": fake_file
        }
        serializer = MiProductRateSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("attachment", serializer.errors)


# =====================================================================
# 3. INTEGRATION TESTS: REST API CRUD & FILE UPLOAD
# =====================================================================

class MiProductRateAPIIntegrationTests(TestCase):
    """
    Integration tests covering API endpoints with Oracle DB transactions.
    """

    def setUp(self):
        self.client = APIClient()
        self.sample_rate = MiProductRate.objects.create(
            service="Enterprise Leased Line",
            executive_level="Platinum",
            rate=Decimal("150000.00"),
            created_user="slt_admin",
            status="Active"
        )

    def test_list_rates_api(self):
        """GET /api/mi-product-rates/ returns 200 and list of rates"""
        resp = self.client.get('/api/mi-product-rates/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.json(), list)
        self.assertGreaterEqual(len(resp.json()), 1)

    def test_retrieve_single_rate_api(self):
        """GET /api/mi-product-rates/<id>/ returns single record"""
        resp = self.client.get(f'/api/mi-product-rates/{self.sample_rate.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()['sr_id'], self.sample_rate.sr_id)

    def test_create_rate_with_file_upload(self):
        """POST /api/mi-product-rates/ with multipart file attachment"""
        dummy_pdf = SimpleUploadedFile("Rate_Approval.pdf", b"%PDF-1.4 dummy pdf bytes", content_type="application/pdf")
        payload = {
            "service": "SD-WAN Corporate",
            "executive_level": "Gold Tier",
            "rate": "89000.00",
            "status": "Active",
            "created_user": "anushka_intern",
            "comments": "Signed commercial agreement",
            "attachment": dummy_pdf
        }
        resp = self.client.post('/api/mi-product-rates/', payload, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("sr_id", resp.json())
        self.assertIsNotNone(resp.json()['attachment_url'])
        self.assertIn("download_url", resp.json())

    def test_update_rate_api(self):
        """PATCH /api/mi-product-rates/<id>/ partially updates record"""
        payload = {
            "rate": "165000.00",
            "status": "Inactive"
        }
        resp = self.client.patch(f'/api/mi-product-rates/{self.sample_rate.id}/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.sample_rate.refresh_from_db()
        self.assertEqual(self.sample_rate.rate, Decimal("165000.00"))
        self.assertEqual(self.sample_rate.status, "Inactive")

    def test_delete_rate_api(self):
        """DELETE /api/mi-product-rates/<id>/ removes record"""
        rate_to_del = MiProductRate.objects.create(
            service="Temporary Link",
            executive_level="Bronze",
            rate=Decimal("12000.00"),
            created_user="temp_user"
        )
        resp = self.client.delete(f'/api/mi-product-rates/{rate_to_del.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(MiProductRate.objects.filter(id=rate_to_del.id).exists())

    def test_download_endpoint_with_attachment(self):
        """GET /api/mi-product-rates/<id>/download/ returns FileResponse with attachment header"""
        sample_file = SimpleUploadedFile("test_doc.pdf", b"%PDF-1.4 sample content", content_type="application/pdf")
        rate_with_file = MiProductRate.objects.create(
            service="Hosting Package",
            executive_level="Silver",
            rate=Decimal("35000.00"),
            created_user="host_admin",
            attachment=sample_file
        )
        resp = self.client.get(f'/api/mi-product-rates/{rate_with_file.id}/download/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("Content-Disposition", resp.headers)
        self.assertIn("attachment", resp.headers["Content-Disposition"])

    def test_search_filter_endpoint(self):
        """GET /api/mi-product-rates/?search=Enterprise returns filtered results"""
        resp = self.client.get('/api/mi-product-rates/?search=Enterprise')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.json()
        self.assertTrue(any("Enterprise" in r["service"] for r in results))


# =====================================================================
# 4. INTEGRATION TESTS: AUTHENTICATION & GOOGLE OAUTH
# =====================================================================

class AuthenticationAPIIntegrationTests(TestCase):
    """
    Integration tests for user registration, login, and Google sign-in.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="test_executive",
            email="executive@sltmobitel.lk",
            password="SecurePassword123#",
            first_name="Test",
            last_name="Executive"
        )

    def test_user_registration_success(self):
        """POST /api/auth/register/ creates user and returns 201"""
        payload = {
            "username": "new_intern",
            "email": "new.intern@sltmobitel.lk",
            "password": "InternPassword123#",
            "full_name": "New Intern"
        }
        resp = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="new_intern").exists())

    def test_user_registration_duplicate_username_rejected(self):
        """Duplicate username registration returns 400"""
        payload = {
            "username": "test_executive",
            "email": "another@sltmobitel.lk",
            "password": "Password123#"
        }
        resp = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """POST /api/auth/login/ returns 200 with user profile"""
        payload = {
            "username": "test_executive",
            "password": "SecurePassword123#"
        }
        resp = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()['user']['username'], "test_executive")

    def test_user_login_invalid_password(self):
        """POST /api/auth/login/ with wrong password returns 401"""
        payload = {
            "username": "test_executive",
            "password": "WrongPassword!"
        }
        resp = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_google_oauth_login_flow(self):
        """POST /api/auth/google/ creates or signs in user with Google profile"""
        payload = {
            "email": "anushka.google@sltmobitel.lk",
            "name": "Anushka Google",
            "picture": "https://lh3.googleusercontent.com/test.jpg"
        }
        resp = self.client.post('/api/auth/google/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(email="anushka.google@sltmobitel.lk").exists())
        self.assertEqual(resp.json()['user']['email'], "anushka.google@sltmobitel.lk")
