# API Documentation - Q-ERP Backend

## Overview

FastAPI Backend for ERP & RAG System with MS SQL Server 2025, RBAC, Chat History, OCR, and Knowledge Base.

**Base URL:** `http://localhost:8000/api/v1`

**Authentication:** Bearer JWT Token (required for most endpoints, development mode bypasses auth)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Configuration API](#configuration-api)
3. [Admin API (RBAC Management)](#admin-api-rbac-management)
4. [Session & Message Management](#session--message-management)
5. [Chat API](#chat-api)
6. [ERP Summarization](#erp-summarization)
7. [OCR & Extraction](#ocr--extraction)
8. [Knowledge Base (RAG)](#knowledge-base-rag)

---

## Authentication

### JWT Token Format

```json
{
  "sub": "username",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "exp": 1735689600
}
```

### Headers

```http
Authorization: Bearer <your_jwt_token>
```

---

## Configuration API

Endpoints for managing runtime configuration and LLM model selection.

### 1. Get Configuration

**Endpoint:** `GET /api/v1/config`

**Auth:** None (Public)

**Response:**
```json
{
  "ollama_url": "http://10.61.1.35:11434",
  "default_model": "alibayram/Qwen3-30B-A3B-Instruct-2507",
  "summarize_model": "alibayram/Qwen3-30B-A3B-Instruct-2507",
  "knowledge_model": "alibayram/Qwen3-30B-A3B-Instruct-2507"
}
```

### 2. Update Configuration

**Endpoint:** `POST /api/v1/config`

**Auth:** None (Public)

**Request:**
```json
{
  "llm_provider": "ollama",
  "ollama_url": "http://new-ollama-host:11434",
  "vllm_url": "http://new-vllm-host:8000",
  "default_model": "llama3:latest",
  "ollama_model": "qwen2.5:14b",
  "vllm_model": "alibayram/Qwen3-30B-A3B-Instruct-2507",
  "context_window": "261000",
  "max_token": "32441"
}
```

**Response:**
```json
{
  "ollama_url": "http://new-ollama-host:11434",
  "default_model": "llama3:latest",
  "ollama_model": "qwen2.5:14b",
  "vllm_model": "alibayram/Qwen3-30B-A3B-Instruct-2507",
  "summarize_model": "llama3:latest",
  "knowledge_model": "llama3:latest"
}
```

### 3. List Available Models

**Endpoint:** `GET /api/v1/config/models`

**Auth:** None (Public)

**Response:**
```json
[
  "alibayram/Qwen3-30B-A3B-Instruct-2507",
  "llama3:latest",
  "qwen3-vl:8b",
  "bge-m3"
]
```

### 4. Set Default Model

**Endpoint:** `POST /api/v1/config/model/default`

**Auth:** None (Public)

**Description:** Updates the default model for the currently active LLM provider (Ollama or vLLM).

**Request:**
```json
{
  "model": "alibayram/Qwen3-30B-A3B-Instruct-2507"
}
```

**Response:**
```json
{
  "default_model": "alibayram/Qwen3-30B-A3B-Instruct-2507"
}
```

### 5. Set Summarization Model

**Endpoint:** `POST /api/v1/config/model/summarize`

**Auth:** None (Public)

**Request:**
```json
{
  "model": "qwen3-vl:8b"
}
```

**Response:**
```json
{
  "summarize_model": "qwen3-vl:8b"
}
```

### 6. Set Knowledge Model

**Endpoint:** `POST /api/v1/config/model/knowledge`

**Auth:** None (Public)

**Request:**
```json
{
  "model": "llama3:latest"
}
```

**Response:**
```json
{
  "knowledge_model": "llama3:latest"
}
```

---

## Admin API (RBAC Management)

Admin-only endpoints for managing roles, functions, and user permissions.

### 1. Create Function

**Endpoint:** `POST /api/v1/admin/functions`

**Auth:** Admin only

**Request:**
```json
{
  "name": "summarize-inventory",
  "description": "Access to inventory summarization",
  "category": "erp"
}
```

**Response:**
```json
{
  "id": 13,
  "name": "summarize-inventory",
  "description": "Access to inventory summarization",
  "category": "erp",
  "is_active": true,
  "created_at": "2025-12-08T10:30:00"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/functions \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "summarize-inventory",
    "description": "Access to inventory summarization",
    "category": "erp"
  }'
```

### 2. List Functions

**Endpoint:** `GET /api/v1/admin/functions?category=erp&include_inactive=false`

**Auth:** Admin only

**Response:**
```json
[
  {
    "id": 1,
    "name": "summarize",
    "description": "Access to data summarization features",
    "category": "erp",
    "is_active": true,
    "created_at": "2025-12-08T10:00:00"
  },
  {
    "id": 2,
    "name": "summarize-production",
    "description": "Access to production data summarization",
    "category": "erp",
    "is_active": true,
    "created_at": "2025-12-08T10:00:00"
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/functions?category=erp" \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Update Function

**Endpoint:** `PUT /api/v1/admin/functions/{function_id}`

**Auth:** Admin only

**Request:**
```json
{
  "description": "Updated description",
  "is_active": false
}
```

**Response:**
```json
{
  "id": 13,
  "name": "summarize-inventory",
  "description": "Updated description",
  "category": "erp",
  "is_active": false,
  "created_at": "2025-12-08T10:30:00"
}
```

### 4. Create Role

**Endpoint:** `POST /api/v1/admin/roles`

**Auth:** Admin only

**Request:**
```json
{
  "name": "manager",
  "description": "Manager with extended permissions"
}
```

**Response:**
```json
{
  "id": 4,
  "name": "manager",
  "description": "Manager with extended permissions",
  "is_active": true,
  "created_at": "2025-12-08T10:35:00",
  "functions": []
}
```

### 5. List Roles

**Endpoint:** `GET /api/v1/admin/roles?include_inactive=false`

**Auth:** Admin only

**Response:**
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Administrator with full system access",
    "is_active": true,
    "created_at": "2025-12-08T10:00:00",
    "functions": ["summarize", "ocr", "knowledge", "admin", "user-management"]
  },
  {
    "id": 2,
    "name": "user",
    "description": "Standard user with limited access",
    "is_active": true,
    "created_at": "2025-12-08T10:00:00",
    "functions": ["summarize", "ocr", "knowledge"]
  }
]
```

### 6. Assign Function to Role

**Endpoint:** `POST /api/v1/admin/roles/{role_id}/assign-function`

**Auth:** Admin only

**Request:**
```json
{
  "function_id": 13
}
```

**Response:**
```json
{
  "message": "Function 'summarize-inventory' assigned to role 'manager'"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/roles/4/assign-function \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"function_id": 13}'
```

### 7. Remove Function from Role

**Endpoint:** `DELETE /api/v1/admin/roles/{role_id}/functions/{function_id}`

**Auth:** Admin only

**Response:**
```json
{
  "message": "Function removed from role"
}
```

### 8. Assign Role to User

**Endpoint:** `POST /api/v1/admin/users/{user_id}/assign-role`

**Auth:** Admin only

**Request:**
```json
{
  "role_id": 4
}
```

**Response:**
```json
{
  "message": "Role 'manager' assigned to user 'john_doe'"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/assign-role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role_id": 4}'
```

### 9. Remove Role from User

**Endpoint:** `DELETE /api/v1/admin/users/{user_id}/roles/{role_id}`

**Auth:** Admin only

**Response:**
```json
{
  "message": "Role removed from user"
}
```

### 10. List Users

**Endpoint:** `GET /api/v1/admin/users?limit=100&offset=0`

**Auth:** Admin only

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "is_active": true,
    "is_external": false,
    "created_at": "2025-12-01T08:00:00",
    "roles": ["admin", "user"],
    "functions": ["summarize", "ocr", "knowledge", "admin"]
  }
]
```

### 11. Get User Details

**Endpoint:** `GET /api/v1/admin/users/{user_id}`

**Auth:** Admin only

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "is_active": true,
  "is_external": false,
  "created_at": "2025-12-01T08:00:00",
  "roles": ["admin", "user"],
  "functions": ["summarize", "ocr", "knowledge", "admin"]
}
```

---

## Session & Message Management

Manage chat sessions and messages with context storage.

### 1. Create Session

**Endpoint:** `POST /api/v1/sessions`

**Auth:** Required

**Request:**
```json
{
  "mode": "summarize",
  "title": "Q4 Production Analysis",
  "summary_context": "Production data for Q4 2024: Total units: 15,234...",
  "context_metadata": {
    "data_source": "production_summary",
    "date_range": "2024-10-01 to 2024-12-31"
  }
}
```

**Response:**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Q4 Production Analysis",
  "mode": "summarize",
  "summary_context": "Production data for Q4 2024: Total units: 15,234...",
  "context_metadata": {
    "data_source": "production_summary",
    "date_range": "2024-10-01 to 2024-12-31"
  },
  "is_active": true,
  "created_at": "2025-12-08T11:00:00",
  "updated_at": "2025-12-08T11:00:00",
  "message_count": 0
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "summarize",
    "title": "Q4 Production Analysis",
    "summary_context": "Production data for Q4 2024..."
  }'
```

### 2. List Sessions

**Endpoint:** `GET /api/v1/sessions?limit=50&offset=0`

**Auth:** Required

**Response:**
```json
[
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "title": "Q4 Production Analysis",
    "mode": "summarize",
    "is_active": true,
    "created_at": "2025-12-08T11:00:00",
    "updated_at": "2025-12-08T11:05:00",
    "message_count": 5,
    "last_message_preview": "What was the total production in October?"
  },
  {
    "id": "8d1f7780-8536-51ef-b55c-f18fd2e01bf8",
    "title": "Invoice Analysis",
    "mode": "ocr",
    "is_active": true,
    "created_at": "2025-12-07T14:30:00",
    "updated_at": "2025-12-07T14:35:00",
    "message_count": 3,
    "last_message_preview": "Extract the total amount from this invoice."
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/sessions?limit=10" \
  -H "Authorization: Bearer <token>"
```

### 3. Get Session Details

**Endpoint:** `GET /api/v1/sessions/{session_id}?include_messages=true&message_limit=100`

**Auth:** Required

**Response:**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Q4 Production Analysis",
  "mode": "summarize",
  "summary_context": "Production data for Q4 2024: Total units: 15,234...",
  "context_metadata": {
    "data_source": "production_summary"
  },
  "is_active": true,
  "created_at": "2025-12-08T11:00:00",
  "updated_at": "2025-12-08T11:05:00",
  "message_count": 2,
  "messages": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "role": "user",
      "content": "What was the total production in October?",
      "feedback": "none",
      "meta_data": {"language": "en"},
      "created_at": "2025-12-08T11:01:00"
    },
    {
      "id": "b2c3d4e5-f678-9012-bcde-f12345678901",
      "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "role": "assistant",
      "content": "According to the production data, total production in October was 5,234 units...",
      "feedback": "like",
      "meta_data": {"language": "en", "model": "alibayram/Qwen3-30B-A3B-Instruct-2507"},
      "created_at": "2025-12-08T11:01:05"
    }
  ]
}
```

### 4. Update Session

**Endpoint:** `PATCH /api/v1/sessions/{session_id}`

**Auth:** Required

**Request:**
```json
{
  "title": "Updated Title",
  "is_active": true
}
```

**Response:**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Title",
  "mode": "summarize",
  "summary_context": "...",
  "is_active": true,
  "created_at": "2025-12-08T11:00:00",
  "updated_at": "2025-12-08T11:10:00",
  "message_count": 2
}
```

### 5. Delete Session

**Endpoint:** `DELETE /api/v1/sessions/{session_id}?permanent=false`

**Auth:** Required

**Response:**
```json
{
  "message": "Session deleted successfully",
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "permanent": false
}
```

**Example:**
```bash
# Soft delete (default)
curl -X DELETE http://localhost:8000/api/v1/sessions/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer <token>"

# Permanent delete
curl -X DELETE "http://localhost:8000/api/v1/sessions/7c9e6679-7425-40de-944b-e07fc1f90ae7?permanent=true" \
  -H "Authorization: Bearer <token>"
```

### 6. Get Session Messages

**Endpoint:** `GET /api/v1/sessions/{session_id}/messages?limit=100&offset=0`

**Auth:** Required

**Response:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "role": "user",
    "content": "What was the total production in October?",
    "feedback": "none",
    "meta_data": {"language": "en"},
    "created_at": "2025-12-08T11:01:00"
  },
  {
    "id": "b2c3d4e5-f678-9012-bcde-f12345678901",
    "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "role": "assistant",
    "content": "According to the production data, total production in October was 5,234 units...",
    "feedback": "like",
    "meta_data": {"language": "en"},
    "created_at": "2025-12-08T11:01:05"
  }
]
```

### 7. Update Message Feedback

**Endpoint:** `PATCH /api/v1/messages/{message_id}/feedback`

**Auth:** Required

**Request:**
```json
{
  "feedback": "like"
}
```

**Response:**
```json
{
  "id": "b2c3d4e5-f678-9012-bcde-f12345678901",
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "role": "assistant",
  "content": "According to the production data...",
  "feedback": "like",
  "meta_data": {"language": "en"},
  "created_at": "2025-12-08T11:01:05"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/messages/b2c3d4e5-f678-9012-bcde-f12345678901/feedback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"feedback": "like"}'
```

### 8. Set Session Context

**Endpoint:** `POST /api/v1/sessions/{session_id}/set-context`

**Auth:** Required

**Request:**
```json
{
  "summary_context": "Updated production data: Total units: 16,500...",
  "context_metadata": {
    "updated_at": "2025-12-08",
    "source": "latest_report"
  }
}
```

**Response:**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Q4 Production Analysis",
  "mode": "summarize",
  "summary_context": "Updated production data: Total units: 16,500...",
  "context_metadata": {
    "updated_at": "2025-12-08",
    "source": "latest_report"
  },
  "is_active": true,
  "created_at": "2025-12-08T11:00:00",
  "updated_at": "2025-12-08T11:15:00",
  "message_count": 2
}
```

---

## Chat API

Ask questions with session context and chat history.

### 1. Ask Custom Question (New)

**Endpoint:** `POST /api/v1/chat/question`

**Auth:** Required

**Request:**
```json
{
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "question": "What was the average production per month in Q4?",
  "language": "en"
}
```

**Response:**
```json
{
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "question": "What was the average production per month in Q4?",
  "ai_response": "Based on the production data for Q4 2024, the average production per month was 5,078 units. October had 5,234 units, November had 5,100 units, and December had 4,900 units.",
  "sources": null,
  "processing_time": 1.234,
  "answered_at": "2025-12-08T11:20:00"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/chat/question \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "question": "What was the average production per month in Q4?",
    "language": "en"
  }'
```

**Note:** 
- User question and AI response are **automatically saved** to the messages table
- Context is retrieved from the session's `summary_context` field
- Chat history is included for contextual conversation

### 2. Get Chat History

**Endpoint:** `GET /api/v1/chat/sessions/{session_id}/history?limit=50`

**Auth:** Required

**Response:**
```json
{
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "messages": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "role": "user",
      "content": "What was the total production in October?",
      "feedback": "none",
      "created_at": "2025-12-08T11:01:00"
    },
    {
      "id": "b2c3d4e5-f678-9012-bcde-f12345678901",
      "role": "assistant",
      "content": "According to the production data, total production in October was 5,234 units...",
      "feedback": "like",
      "created_at": "2025-12-08T11:01:05"
    }
  ]
}
```

---

## ERP Summarization

Analyze and summarize ERP data (Production and Sales).

### 1. Get Production Summary

**Endpoint:** `GET /api/v1/erp/production/summary`

**Auth:** Required

**Parameters:**
- `production_type` (required): "Finished" or "WIP"
- `date_format` (optional): "year_only" or "year_month"
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `include_ai_insights` (optional, default=true): Include AI insights
- `language` (optional, default="en"): "en" or "th"

**Response:**
```json
{
  "production_type": "Finished",
  "date_format": "year_month",
  "total_records": 1234,
  "date_range": {
    "min_date": "2024-01-01",
    "max_date": "2024-12-31"
  },
  "summary_stats": {
    "Quantity": {
      "total": 15234.0,
      "mean": 12.35,
      "count": 1234,
      "min": 1.0,
      "max": 500.0
    }
  },
  "categorical_analysis": {
    "ProductGroup": {
      "Group A": 450,
      "Group B": 384
    }
  },
  "time_analysis": {
    "monthly_trends": {
      "2024-01": 1250,
      "2024-02": 1180
    }
  },
  "summary_context": "Production Summary for Finished Products:\nTotal Records: 1,234\nDate Range: 2024-01-01 to 2024-12-31\n\nQuantity Statistics:\n- Total: 15,234 units\n- Average per record: 12.35 units...",
  "ai_insights": "Based on the production data analysis, we observe a steady increase in production output throughout the year. The peak production occurred in Q4 with 5,234 units...",
  "processing_time": 2.345,
  "generated_at": "2025-12-08T12:00:00"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/erp/production/summary?production_type=Finished&date_format=year_month&include_ai_insights=true&language=en" \
  -H "Authorization: Bearer <token>"
```

### 1b. Get Production Summary (POST)

**Endpoint:** `POST /api/v1/erp/production/summary`

**Auth:** Required

**Description:** Alternative endpoint for production summary using POST with request body. Useful for complex requests or when query parameters become too long.

**Request:**
```json
{
  "production_type": "Finished",
  "date_format": "year_month",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31",
  "include_ai_insights": true,
  "language": "en"
}
```

**Response:** Same as GET method (see above)

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/erp/production/summary \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "production_type": "Finished",
    "date_format": "year_month",
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "include_ai_insights": true,
    "language": "en"
  }'
```

### 2. Get Sales Summary

**Endpoint:** `GET /api/v1/erp/sales/summary`

**Auth:** Required

**Parameters:**
- `date_format` (optional): "year_only" or "year_month"
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `department` (optional): Filter by department
- `region` (optional): Filter by region
- `include_ai_insights` (optional, default=true): Include AI insights
- `language` (optional, default="en"): "en" or "th"

**Response:**
```json
{
  "date_format": "year_month",
  "filters_applied": {
    "original_records": 5678,
    "filtered_records": 5678
  },
  "total_records": 5678,
  "date_range": {
    "min_date": "2024-01-01",
    "max_date": "2024-12-31"
  },
  "sales_metrics": {
    "TotalAmount": {
      "total": 12500000.50,
      "mean": 2200.15,
      "count": 5678,
      "min": 100.00,
      "max": 250000.00
    }
  },
  "department_analysis": {
    "Sales Dept A": 2500000.00,
    "Sales Dept B": 2100000.00
  },
  "regional_analysis": {
    "North": 3500000.00,
    "Central": 4500000.00,
    "South": 2000000.00
  },
  "product_analysis": {
    "top_products": [
      {"name": "Product A", "revenue": 1500000.00},
      {"name": "Product B", "revenue": 1200000.00}
    ]
  },
  "customer_analysis": {
    "total_customers": 350,
    "top_customers": [
      {"name": "Customer A", "revenue": 850000.00}
    ]
  },
  "time_trends": {
    "monthly_revenue": {
      "2024-01": 950000.00,
      "2024-02": 1050000.00
    }
  },
  "summary_context": "Sales Summary:\nTotal Records: 5,678\nTotal Revenue: 12,500,000.50 THB\n\nTop Performing Department: Sales Dept A\nTop Performing Region: Central...",
  "ai_insights": "Sales performance shows strong growth throughout the year, with consistent month-over-month increases. The Central region dominates sales with 36% of total revenue...",
  "processing_time": 3.456,
  "generated_at": "2025-12-08T12:05:00"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/erp/sales/summary?date_format=year_month&department=Sales%20Dept%20A&language=th" \
  -H "Authorization: Bearer <token>"
```

### 2b. Get Sales Summary (POST)

**Endpoint:** `POST /api/v1/erp/sales/summary`

**Auth:** Required

**Description:** Alternative endpoint for sales summary using POST with request body. Useful for complex requests or when query parameters become too long.

**Request:**
```json
{
  "date_format": "year_month",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31",
  "department": "Sales Dept A",
  "region": "Central",
  "include_ai_insights": true,
  "language": "th"
}
```

**Response:** Same as GET method (see above)

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/erp/sales/summary \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date_format": "year_month",
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "department": "Sales Dept A",
    "region": "Central",
    "include_ai_insights": true,
    "language": "th"
  }'
```

### 3. Get ERP Health Status

**Endpoint:** `GET /api/v1/erp/health`

**Auth:** Not required

**Response:**
```json
{
  "status": "healthy",
  "data_sources": {
    "sales_data": true,
    "finished_production": true,
    "wip_production": true
  },
  "last_data_refresh": "2025-12-08T12:00:00",
  "total_sales_records": 5678,
  "total_production_records": {
    "finished": 1234,
    "wip": 456
  },
  "processing_capabilities": {
    "statistical_analysis": true,
    "trend_analysis": true,
    "ai_insights": true,
    "export_capabilities": true
  }
}
```

### 4. Get Data Sources Info

**Endpoint:** `GET /api/v1/erp/data-sources`

**Auth:** Required

**Response:**
```json
{
  "status": "active",
  "data_sources": {
    "sales_data": true,
    "finished_production": true,
    "wip_production": true
  },
  "total_records": {
    "sales": 5678,
    "production": {
      "finished": 1234,
      "wip": 456
    }
  },
  "supported_formats": ["CSV", "JSON"],
  "available_filters": {
    "sales": ["department", "region", "date_format"],
    "production": ["production_type", "date_format"]
  },
  "date_formats": ["year_only", "year_month"]
}
```

### 5. Custom Question (Session-Based)

**Endpoint:** `POST /api/v1/erp/custom-question`

**Auth:** Required

**Description:** Ask custom questions about ERP data using session context. This endpoint retrieves the `summary_context` from the session (created from production/sales summary) and uses it to answer questions.

**Request:**
```json
{
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "question": "What was the total sales in Q3?",
  "language": "en",
  "model": "optional-model-override"
}
```

**Response:**
```json
{
  "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "question": "What was the total sales in Q3?",
  "ai_response": "Based on the sales data in your session, total sales in Q3 were 3,500,000 THB. This represents a 15% increase compared to Q2...",
  "sources": null,
  "processing_time": 1.234,
  "answered_at": "2025-12-08T12:10:00"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/erp/custom-question \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "question": "What was the total sales in Q3?",
    "language": "en"
  }'
```

**Workflow:**
1. Get production or sales summary (GET or POST `/api/v1/erp/production/summary` or `/api/v1/erp/sales/summary`)
2. Create a session with the `summary_context` from step 1 (`POST /api/v1/sessions`)
3. Ask questions using the session_id (`POST /api/v1/erp/custom-question`)

**Error Responses:**
- **404 Not Found:** Session not found or access denied
- **400 Bad Request:** Session does not contain summary context

**Note:** This endpoint is similar to `/api/v1/chat/question` but specifically designed for ERP data analysis. For general chat functionality, use the Chat API.

---

## OCR & Extraction

Extract structured data from documents using OCR.

### 1. Extract from Document

**Endpoint:** `POST /api/v1/ocr/extract`

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Description:** Extract structured data from document and save to chat history. The uploaded file is NOT stored in the database - only the extraction request and results are saved to the session's message history.

**Parameters:**
- `file` (required): Document file (PNG, JPG, PDF)
- `session_id` (required): UUID of the chat session (must belong to authenticated user)
- `document_type` (required): "Invoice", "PurchaseOrder", "Receipt", "Contract", "CreditDebitNote", "SalesOrder"
- `extract_text_only` (optional, default=false): Extract only text
- `confidence_threshold` (optional, default=0.6): Minimum confidence (0-1)
- `language` (optional, default="en"): "en" or "th"

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/ocr/extract \
  -H "Authorization: Bearer <token>" \
  -F "file=@invoice.pdf" \
  -F "session_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "document_type=Invoice" \
  -F "confidence_threshold=0.7" \
  -F "language=en"
```

**Response:**
```json
{
  "extraction_successful": true,
  "document_type": "Invoice",
  "confidence_score": 0.85,
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "invoice_date": "2024-12-01",
    "vendor_name": "ABC Company Ltd.",
    "vendor_address": "123 Main St, Bangkok",
    "total_amount": 15000.00,
    "currency": "THB",
    "line_items": [
      {
        "description": "Product A",
        "quantity": 10,
        "unit_price": 1000.00,
        "amount": 10000.00
      },
      {
        "description": "Product B",
        "quantity": 5,
        "unit_price": 1000.00,
        "amount": 5000.00
      }
    ],
    "subtotal": 15000.00,
    "tax": 0.00,
    "total": 15000.00
  },
  "raw_text": "INVOICE\nINV-2024-001\nDate: 2024-12-01\n...",
  "processing_time": 3.456,
  "extracted_at": "2025-12-08T13:00:00"
}
```

### 2. Extract Text Only

**Endpoint:** `POST /api/v1/ocr/extract-text`

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): Document file
- `extract_method` (optional, default="auto"): "auto", "ocr", "pdf"

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/ocr/extract-text \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "extract_method=auto"
```

**Response:**
```json
{
  "extracted_text": "This is the full text content extracted from the document...",
  "confidence_score": 0.92,
  "extraction_method": "pdf",
  "character_count": 1234,
  "processing_time": 1.234,
  "extracted_at": "2025-12-08T13:05:00"
}
```

### 3. Validate Extraction

**Endpoint:** `POST /api/v1/ocr/validate`

**Auth:** Required

**Request:**
```json
{
  "invoice_number": "INV-2024-001",
  "invoice_date": "2024-12-01",
  "total_amount": 15000.00
}
```

**Query Parameters:**
- `document_type` (required): Document type used for extraction

**Response:**
```json
{
  "is_valid": true,
  "validation_errors": [],
  "quality_assessment": {
    "completeness": 0.95,
    "confidence_score": 0.85,
    "field_coverage": 0.90
  },
  "suggestions": [
    "All required fields are present and valid"
  ],
  "validated_at": "2025-12-08T13:10:00"
}
```

### 4. Get OCR Capabilities

**Endpoint:** `GET /api/v1/ocr/capabilities`

**Auth:** Not required

**Response:**
```json
{
  "supported_document_types": [
    {
      "type_name": "Invoice",
      "description": "Commercial invoices with line items",
      "schema_name": "InvoiceSchema",
      "sample_fields": ["invoice_number", "invoice_date", "vendor_name", "total_amount"]
    },
    {
      "type_name": "PurchaseOrder",
      "description": "Purchase orders",
      "schema_name": "PurchaseOrderSchema",
      "sample_fields": ["po_number", "po_date", "supplier", "items"]
    }
  ],
  "supported_formats": ["PDF", "PNG", "JPG", "JPEG"],
  "max_file_size_mb": 10,
  "processing_capabilities": {
    "ocr": true,
    "structured_extraction": true,
    "multi_language": true
  }
}
```

### 5. Get OCR Health Status

**Endpoint:** `GET /api/v1/ocr/health`

**Auth:** Not required

**Response:**
```json
{
  "status": "healthy",
  "ollama_available": true,
  "ocr_engine_available": true,
  "supported_languages": ["en", "th"],
  "processing_capabilities": {
    "text_extraction": true,
    "structured_extraction": true,
    "pdf_processing": true
  }
}
```

### 6. Get Document Types

**Endpoint:** `GET /api/v1/ocr/document-types`

**Auth:** Not required

**Response:**
```json
{
  "document_types": [
    {
      "name": "Invoice",
      "description": "Commercial invoices with line items and totals",
      "supported": true
    },
    {
      "name": "PurchaseOrder",
      "description": "Purchase orders for procurement",
      "supported": true
    },
    {
      "name": "Receipt",
      "description": "Payment receipts and transaction records",
      "supported": true
    },
    {
      "name": "Contract",
      "description": "Legal contracts and agreements",
      "supported": true
    },
    {
      "name": "CreditDebitNote",
      "description": "Credit notes and debit notes for invoice adjustments",
      "supported": true
    },
    {
      "name": "SalesOrder",
      "description": "Sales orders from customers",
      "supported": true
    }
  ]
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/ocr/document-types \
  -H "Authorization: Bearer <token>"
```

### 7. Batch Extract

**Endpoint:** `POST /api/v1/ocr/batch-extract`

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Parameters:**
- `files` (required): Multiple document files (max 10)
- `document_type` (required): Document type for all files
- `extract_text_only` (optional, default=false)

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/ocr/batch-extract \
  -H "Authorization: Bearer <token>" \
  -F "files=@invoice1.pdf" \
  -F "files=@invoice2.pdf" \
  -F "files=@invoice3.pdf" \
  -F "document_type=Invoice"
```

**Response:**
```json
{
  "total_files": 3,
  "successful_extractions": 2,
  "results": [
    {
      "file_index": 0,
      "filename": "invoice1.pdf",
      "result": {
        "extraction_successful": true,
        "confidence_score": 0.85,
        "extracted_data": {...}
      }
    },
    {
      "file_index": 1,
      "filename": "invoice2.pdf",
      "result": {
        "extraction_successful": true,
        "confidence_score": 0.90,
        "extracted_data": {...}
      }
    },
    {
      "file_index": 2,
      "filename": "invoice3.pdf",
      "error": "File format not supported",
      "result": null
    }
  ]
}
```

### 8. Save OCR Extraction

**Endpoint:** `POST /api/v1/ocr/save`

**Auth:** Required

**Request:**
```json
{
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "total_amount": 15000.00
  },
  "source_filename": "invoice.pdf",
  "extraction_type": "Invoice",
  "confidence_score": 0.85
}
```

**Response:**
```json
{
  "id": "9e8d7c6b-5a4f-3e2d-1c0b-0a9b8c7d6e5f",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "total_amount": 15000.00
  },
  "source_filename": "invoice.pdf",
  "extraction_type": "Invoice",
  "confidence_score": 0.85,
  "created_at": "2025-12-08T13:20:00"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/ocr/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "extracted_data": {
      "invoice_number": "INV-2024-001",
      "total_amount": 15000.00
    },
    "source_filename": "invoice.pdf",
    "extraction_type": "Invoice",
    "confidence_score": 0.85
  }'
```

### 9. Get OCR History

**Endpoint:** `GET /api/v1/ocr/history?page=1&page_size=20`

**Auth:** Required

**Response:**
```json
{
  "items": [
    {
      "id": "9e8d7c6b-5a4f-3e2d-1c0b-0a9b8c7d6e5f",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "extracted_data": {
        "invoice_number": "INV-2024-001",
        "total_amount": 15000.00
      },
      "source_filename": "invoice.pdf",
      "extraction_type": "Invoice",
      "confidence_score": 0.85,
      "created_at": "2025-12-08T13:20:00"
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 20
}
```

### 10. Get OCR History Item

**Endpoint:** `GET /api/v1/ocr/history/{history_id}`

**Auth:** Required

**Response:**
```json
{
  "id": "9e8d7c6b-5a4f-3e2d-1c0b-0a9b8c7d6e5f",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "extracted_data": {
    "invoice_number": "INV-2024-001",
    "invoice_date": "2024-12-01",
    "total_amount": 15000.00
  },
  "source_filename": "invoice.pdf",
  "extraction_type": "Invoice",
  "confidence_score": 0.85,
  "created_at": "2025-12-08T13:20:00"
}
```

---

## Knowledge Base (RAG)

Upload documents and perform semantic search with vector embeddings.

### 1. Ingest Document

**Endpoint:** `POST /api/v1/knowledge/ingest`

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): PDF document to upload
- `chunk_size` (optional, default=1000): Characters per chunk
- `chunk_overlap` (optional, default=200): Overlap between chunks

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/knowledge/ingest \
  -H "Authorization: Bearer <token>" \
  -F "file=@manual.pdf" \
  -F "chunk_size=1000" \
  -F "overlap=200"
```

**Response:**
```json
{
  "parent_document_id": 123,
  "filename": "manual.pdf",
  "total_chunks": 45,
  "total_pages": 25,
  "file_size": 2048576,
  "processing_time": 15.234,
  "uploaded_at": "2025-12-08T14:00:00"
}
```

### 2. Query Knowledge Base

**Endpoint:** `POST /api/v1/knowledge/query`

**Auth:** Required

**Description:** Query the knowledge base using semantic search. The query and AI response are automatically saved to the session's message history for conversation tracking.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "prompt": "How to configure the database connection?",
  "top_k": 5,
  "threshold": 0.7,
  "include_content": true,
  "language": "en",
  "model": "optional-model-override"
}
```

**Parameters:**
- `session_id` (required): UUID of the chat session (must belong to authenticated user)
- `prompt` (required): Search query text (1-2000 characters)
- `top_k` (optional, default=5): Number of results to return (1-20)
- `threshold` (optional, default=0.5): Similarity threshold (0-1)
- `include_content` (optional, default=true): Include full document content
- `language` (optional, default="en"): "en" or "th" for AI-generated responses
- `model` (optional): Override the default chat model for this request

**Response:**
```json
{
  "query": "How to configure the database connection?",
  "results": [
    {
      "id": 1001,
      "filename": "manual.pdf",
      "content": "To configure the database connection, set the DATABASE_URL environment variable in your .env file. The format should be: DRIVER={ODBC Driver 18 for SQL Server};SERVER=...",
      "content_preview": "To configure the database connection, set the DATABASE_URL...",
      "similarity_score": 0.92,
      "distance": 0.08,
      "created_at": "2025-12-08T14:00:00",
      "page_number": 5
    },
    {
      "id": 1002,
      "filename": "manual.pdf",
      "content": "For SQLAlchemy connections, you can also set SQLALCHEMY_DATABASE_URL. The system will automatically convert pyodbc format to SQLAlchemy format if needed...",
      "content_preview": "For SQLAlchemy connections, you can also set...",
      "similarity_score": 0.85,
      "distance": 0.15,
      "created_at": "2025-12-08T14:00:00",
      "page_number": 6
    }
  ],
  "total_results": 5,
  "processing_time": 0.456,
  "ai_summary": "To configure database connections, use DATABASE_URL or SQLALCHEMY_DATABASE_URL environment variables..."
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/knowledge/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "prompt": "How to configure the database connection?",
    "top_k": 5,
    "threshold": 0.7,
    "include_content": true,
    "language": "en"
  }'
```

### 3. List Documents

**Endpoint:** `GET /api/v1/knowledge/documents?limit=50&offset=0`

**Auth:** Required

**Response:**
```json
{
  "documents": [
    {
      "id": 123,
      "filename": "manual.pdf",
      "total_chunks": 45,
      "total_pages": 25,
      "file_size": 2048576,
      "created_at": "2025-12-08T14:00:00"
    },
    {
      "id": 124,
      "filename": "api_guide.pdf",
      "total_chunks": 30,
      "total_pages": 18,
      "file_size": 1536789,
      "created_at": "2025-12-07T10:30:00"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

### 4. Get Document Chunks

**Endpoint:** `GET /api/v1/knowledge/documents/chunks/{parent_document_id}`

**Auth:** Required

**Response:**
```json
{
  "id": 123,
  "filename": "manual.pdf",
  "total_chunks": 45,
  "total_pages": 25,
  "file_size": 2048576,
  "created_at": "2025-12-08T14:00:00",
  "chunks": [
    {
      "id": 1001,
      "page_number": 1,
      "content": "Introduction to the Q-ERP System...",
      "chunk_index": 0
    },
    {
      "id": 1002,
      "page_number": 1,
      "content": "The Q-ERP system provides comprehensive...",
      "chunk_index": 1
    }
  ]
}
```

### 5. Delete Document Chunk by ID

**Endpoint:** `DELETE /api/v1/knowledge/documents/by-id/{document_id}`

**Auth:** Required

**Description:** Delete a single document chunk by its ID.

**Response:**
```json
{
  "id": 1001,
  "filename": "manual.pdf_chunk_5",
  "status": "success",
  "message": "Document chunk deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/knowledge/documents/by-id/1001 \
  -H "Authorization: Bearer <token>"
```

### 6. Delete Document by Parent ID

**Endpoint:** `DELETE /api/v1/knowledge/documents/by-parent/{parent_document_id}`

**Auth:** Required

**Description:** Delete all chunks belonging to a parent document (deletes the entire uploaded document).

**Response:**
```json
{
  "id": 123,
  "filename": "manual.pdf",
  "status": "success",
  "message": "Document deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/knowledge/documents/by-parent/123 \
  -H "Authorization: Bearer <token>"
```

### 7. Download Document

**Endpoint:** `GET /api/v1/knowledge/documents/{parent_document_id}/download`

**Auth:** Required

**Response:** Binary PDF file

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/knowledge/documents/123/download \
  -H "Authorization: Bearer <token>" \
  -o manual.pdf
```

---

## Common Use Cases

### Use Case 1: Complete ERP Analysis with Chat Session

```bash
# 1. Get production summary (GET method)
curl -X GET "http://localhost:8000/api/v1/erp/production/summary?production_type=Finished&date_format=year_month" \
  -H "Authorization: Bearer <token>"

# OR use POST method for complex requests
curl -X POST http://localhost:8000/api/v1/erp/production/summary \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "production_type": "Finished",
    "date_format": "year_month",
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "include_ai_insights": true,
    "language": "en"
  }'

# 2. Create session with summary_context from step 1
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "summarize",
    "title": "Q4 Production Analysis",
    "summary_context": "<paste summary_context from step 1 response>"
  }'

# 3a. Ask questions using Chat API
curl -X POST http://localhost:8000/api/v1/chat/question \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "question": "What was the average production per month?",
    "language": "en"
  }'

# 3b. OR ask questions using ERP API
curl -X POST http://localhost:8000/api/v1/erp/custom-question \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "question": "What was the total production in Q3?",
    "language": "en"
  }'

# 4. Provide feedback on AI responses
curl -X PATCH http://localhost:8000/api/v1/messages/<message_id>/feedback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"feedback": "like"}'
```

### Use Case 2: OCR Document Processing

```bash
# 1. Extract data from invoice
curl -X POST http://localhost:8000/api/v1/ocr/extract \
  -H "Authorization: Bearer <token>" \
  -F "file=@invoice.pdf" \
  -F "document_type=Invoice"

# 2. Save extraction result
curl -X POST http://localhost:8000/api/v1/ocr/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "extracted_data": {extracted_data_from_step_1},
    "source_filename": "invoice.pdf",
    "extraction_type": "Invoice"
  }'

# 3. View history
curl -X GET http://localhost:8000/api/v1/ocr/history \
  -H "Authorization: Bearer <token>"
```

### Use Case 3: Knowledge Base Search

```bash
# 1. Ingest documentation
curl -X POST http://localhost:8000/api/v1/knowledge/ingest \
  -H "Authorization: Bearer <token>" \
  -F "file=@documentation.pdf" \
  -F "chunk_size=1000" \
  -F "overlap=200"

# 2. Query for information with AI summary
curl -X POST http://localhost:8000/api/v1/knowledge/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "how to configure database",
    "top_k": 5,
    "threshold": 0.7,
    "include_content": true,
    "language": "en"
  }'

# 3. View document chunks
curl -X GET http://localhost:8000/api/v1/knowledge/documents/chunks/123 \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Example Error Response

```json
{
  "detail": "Session with id 7c9e6679-7425-40de-944b-e07fc1f90ae7 not found or access denied"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## API Testing

### Using Swagger UI (Development)

When `DEBUG=True`, access interactive API documentation at:

```
http://localhost:8000/api/v1/openapi.json
```

### Using cURL

All examples in this documentation use cURL. Replace `<token>` with your actual JWT token.

### Using Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
TOKEN = "your_jwt_token_here"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Create session
response = requests.post(
    f"{BASE_URL}/sessions",
    json={
        "mode": "summarize",
        "title": "Test Session"
    },
    headers=headers
)

session = response.json()
print(f"Created session: {session['id']}")

# Ask question
response = requests.post(
    f"{BASE_URL}/chat/question",
    json={
        "session_id": session['id'],
        "question": "What is the total?",
        "language": "en"
    },
    headers=headers
)

answer = response.json()
print(f"Answer: {answer['ai_response']}")
```

---

## Support

For issues or questions, contact the development team or refer to the project documentation.

---

**Version:** 1.0.0  
**Last Updated:** December 8, 2025
