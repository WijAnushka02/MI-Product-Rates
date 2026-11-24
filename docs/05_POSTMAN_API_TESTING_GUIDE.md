# Document 05: Task 03 — Postman API Testing Guide

This guide provides end-to-end instructions for testing the **MI Product Rates REST API** in Postman, including `multipart/form-data` file uploads, auto-generation of `SR_ID`, validation rules, and automated test scripts.

---

## 1. Postman Environment Setup

1. Open **Postman**.
2. Click **Environments** > **Add** (or set a Collection variable):
   - Variable Name: `base_url`
   - Initial / Current Value: `http://localhost:8000`

---

## 2. Comprehensive Test Cases

### Test Case 01: Create New Record with File Attachment (POST)

- **Method:** `POST`
- **URL:** `{{base_url}}/api/mi-product-rates/`
- **Body Type:** `form-data` *(Do NOT use raw JSON if uploading an attachment)*
- **Headers:** *(Leave Content-Type unset; Postman automatically sets `multipart/form-data; boundary=...`)*

#### Request Body (form-data):
| Key | Type | Value | Notes |
| :--- | :--- | :--- | :--- |
| `service` | Text | `Dedicated Internet Access` | Required |
| `executive_level` | Text | `Enterprise Gold` | Required |
| `rate` | Text | `125000.50` | Valid decimal (max 2 decimals) |
| `created_user` | Text | `anushka_intern` | Audit user |
| `status` | Text | `Active` | Active / Inactive |
| `comments` | Text | `Annual commercial rate card Q1` | Optional remarks |
| `attachment` | **File** | *(Select a sample `.pdf` or `.png` file)* | Optional document |

#### Expected Response:
- **Status:** `201 Created`
```json
{
  "id": 1,
  "sr_id": "SR001",
  "service": "Dedicated Internet Access",
  "executive_level": "Enterprise Gold",
  "rate": 125000.50,
  "created_date": "2026-11-19T18:30:00+05:30",
  "created_user": "anushka_intern",
  "updated_date": "2026-11-19T18:30:00+05:30",
  "updated_user": null,
  "status": "Active",
  "attachment": "/media/attachments/SR001/rate_card.pdf",
  "attachment_url": "http://localhost:8000/media/attachments/SR001/rate_card.pdf",
  "comments": "Annual commercial rate card Q1"
}
```

#### Postman Test Script:
```javascript
pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("SR_ID is auto-generated in SR00X format", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.sr_id).to.match(/^SR\d{3,}$/);
    pm.environment.set("latest_id", jsonData.id);
});

pm.test("Attachment URL is generated", function () {
    var jsonData = pm.response.json();
    if (jsonData.attachment) {
        pm.expect(jsonData.attachment_url).to.include("http");
    }
});
```

---

### Test Case 02: Create Record Without Attachment (JSON Payload) (POST)

- **Method:** `POST`
- **URL:** `{{base_url}}/api/mi-product-rates/`
- **Headers:** `Content-Type: application/json`

#### Request Body (raw JSON):
```json
{
  "service": "MPLS VPN Link",
  "executive_level": "Silver Tier",
  "rate": 78500.00,
  "created_user": "admin_user",
  "status": "Active",
  "comments": "Fixed intra-branch rate"
}
```

#### Expected Response:
- **Status:** `201 Created`
- `sr_id`: `"SR002"`
- `attachment`: `null`
- `attachment_url`: `null`

---

### Test Case 03: Validation Checks (Negative Tests) (POST)

#### Sub-case 3A: Invalid Decimal Places (More than 2 decimals)
- **Request Body:**
  ```json
  {
    "service": "SIP Trunking",
    "executive_level": "Bronze Tier",
    "rate": 1500.999,
    "created_user": "tester",
    "status": "Active"
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "rate": [
      "Ensure that there are no more than 2 decimal places."
    ]
  }
  ```

#### Sub-case 3B: Negative Rate
- **Request Body:**
  ```json
  {
    "service": "SIP Trunking",
    "executive_level": "Bronze Tier",
    "rate": -50.00,
    "created_user": "tester",
    "status": "Active"
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "rate": [
      "Rate cannot be negative."
    ]
  }
  ```

---

### Test Case 04: List All Records (GET)

- **Method:** `GET`
- **URL:** `{{base_url}}/api/mi-product-rates/`

#### Search & Filtering Capabilities:
- Search by keyword: `{{base_url}}/api/mi-product-rates/?search=Dedicated`
- Ordering: `{{base_url}}/api/mi-product-rates/?ordering=-rate`

#### Expected Response:
- **Status:** `200 OK`
```json
[
  {
    "id": 2,
    "sr_id": "SR002",
    "service": "MPLS VPN Link",
    "executive_level": "Silver Tier",
    "rate": 78500.00,
    "created_date": "2026-11-19T18:35:10+05:30",
    "created_user": "admin_user",
    "updated_date": "2026-11-19T18:35:10+05:30",
    "updated_user": null,
    "status": "Active",
    "attachment": null,
    "attachment_url": null,
    "comments": "Fixed intra-branch rate"
  },
  {
    "id": 1,
    "sr_id": "SR001",
    "service": "Dedicated Internet Access",
    "executive_level": "Enterprise Gold",
    "rate": 125000.50,
    "created_date": "2026-11-19T18:30:00+05:30",
    "created_user": "anushka_intern",
    "updated_date": "2026-11-19T18:30:00+05:30",
    "updated_user": null,
    "status": "Active",
    "attachment": "/media/attachments/SR001/rate_card.pdf",
    "attachment_url": "http://localhost:8000/media/attachments/SR001/rate_card.pdf",
    "comments": "Annual commercial rate card Q1"
  }
]
```

---

### Test Case 05: Retrieve Single Record by ID (GET)

- **Method:** `GET`
- **URL:** `{{base_url}}/api/mi-product-rates/1/`

#### Expected Response:
- **Status:** `200 OK`
- Returns the single object matching `ID = 1`.

---

### Test Case 06: Update Record (PUT / PATCH)

- **Method:** `PATCH`
- **URL:** `{{base_url}}/api/mi-product-rates/1/`
- **Headers:** `Content-Type: application/json`

#### Request Body (JSON):
```json
{
  "rate": 130000.00,
  "status": "Inactive",
  "updated_user": "supervisor_slt",
  "comments": "Rate increased and set to Inactive pending executive sign-off"
}
```

#### Expected Response:
- **Status:** `200 OK`
- Shows updated `rate`, `status: Inactive`, `updated_user: supervisor_slt`, and new `updated_date` timestamp.

---

### Test Case 07: Delete Record (DELETE)

- **Method:** `DELETE`
- **URL:** `{{base_url}}/api/mi-product-rates/1/`

#### Expected Response:
- **Status:** `200 OK` (or `204 No Content`)
```json
{
  "message": "Product rate record SR001 successfully deleted."
}
```

#### Verification:
Subsequent `GET {{base_url}}/api/mi-product-rates/1/` returns `404 Not Found`.

---

## 3. Postman Collection JSON Export

You can save the following JSON as `postman/MI_Product_Rates_API.postman_collection.json` and import it directly into Postman via **Import** > **Upload Files**:

```json
{
  "info": {
    "name": "MI Product Rates Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Create Product Rate (With File Upload)",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "service", "value": "Dedicated Internet Access", "type": "text"},
            {"key": "executive_level", "value": "Enterprise Gold", "type": "text"},
            {"key": "rate", "value": "125000.50", "type": "text"},
            {"key": "created_user", "value": "anushka_intern", "type": "text"},
            {"key": "status", "value": "Active", "type": "text"},
            {"key": "comments", "value": "Annual commercial rate card Q1", "type": "text"},
            {"key": "attachment", "type": "file", "src": ""}
          ]
        },
        "url": {
          "raw": "{{base_url}}/api/mi-product-rates/",
          "host": ["{{base_url}}"],
          "path": ["api", "mi-product-rates", ""]
        }
      }
    },
    {
      "name": "2. List All Product Rates",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/mi-product-rates/",
          "host": ["{{base_url}}"],
          "path": ["api", "mi-product-rates", ""]
        }
      }
    },
    {
      "name": "3. Retrieve Single Rate by ID",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/mi-product-rates/1/",
          "host": ["{{base_url}}"],
          "path": ["api", "mi-product-rates", "1", ""]
        }
      }
    },
    {
      "name": "4. Partial Update (PATCH)",
      "request": {
        "method": "PATCH",
        "header": [
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"rate\": 130000.00,\n    \"status\": \"Inactive\",\n    \"updated_user\": \"supervisor_slt\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/mi-product-rates/1/",
          "host": ["{{base_url}}"],
          "path": ["api", "mi-product-rates", "1", ""]
        }
      }
    },
    {
      "name": "5. Delete Rate Record",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "{{base_url}}/api/mi-product-rates/1/",
          "host": ["{{base_url}}"],
          "path": ["api", "mi-product-rates", "1", ""]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    }
  ]
}
```

Next, proceed to **[06_REACT_FRONTEND_DEVELOPMENT.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/06_REACT_FRONTEND_DEVELOPMENT.md)** to build the responsive React frontend.
