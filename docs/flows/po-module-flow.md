# Purchase Order Module - Flow & API Documentation

> เอกสารนี้อธิบาย flow การทำงานของ PO Module และ API ที่ถูกเรียกในแต่ละขั้นตอน

---

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as Portal
    participant API as Backend API

    U->>P: 1. กรอก Username/Password
    P->>API: 2. POST /api/Login/LoginJWT
    API-->>P: 3. Return accessToken + permission
    P->>API: 4. POST /api/JWT/QERPcMenuJWT
    API-->>P: 5. Return menuToken + menuPermission
    P->>P: 6. Store tokens, redirect to main
```

### APIs ที่เกี่ยวข้อง

| ลำดับ | API | Method | หน้าที่ |
|-------|-----|--------|--------|
| 1 | `/api/Login/LoginJWT` | POST | Login และได้ accessToken |
| 2 | `/api/JWT/QERPcMenuJWT` | POST | ได้ menu permission และ menuToken |
| 3 | `/api/JWT/QERPcMenuActionJWT/{moduleCode}` | GET | ได้ action permission ของ module |

---

## 2. PO List Page Flow

```mermaid
flowchart TD
    A[เข้าหน้า PO List] --> B{มี documentTypes ใน store?}
    B -->|ไม่มี| C[เรียก DocumentTypeRightList API]
    B -->|มี| D[ใช้ค่าจาก store]
    C --> E[เก็บ documentTypes ใน Zustand store]
    E --> F[Auto-select document type แรก]
    D --> F
    F --> G[เรียก POHeaderList API]
    G --> H[แสดงตาราง PO]

    H --> I{User action?}
    I -->|เปลี่ยน Document Type| G
    I -->|ค้นหา| J[Filter ข้อมูลใน client]
    I -->|กด View| K[ไปหน้า PO Form]
    I -->|กด Cancel| L[เรียก POCancel API]
    I -->|กด Submit Approval| M[เรียก SubmitApproval API]
```

### APIs ที่เกี่ยวข้อง

| Trigger | API | Method | หน้าที่ |
|---------|-----|--------|--------|
| เข้าหน้า (ครั้งแรก) | `/api/Document/DocumentTypeRightList` | GET | ดึงประเภทเอกสารที่มีสิทธิ์ |
| เลือก Document Type | `/api/POHeader/POHeaderList` | GET | ดึงรายการ PO |
| กด Cancel | `/api/POHeader/POCancel` | POST | ยกเลิก PO |
| กด Submit Approval | `/api/Approval/SubmitApproval` | POST | ส่งอนุมัติ |

### Query Parameters

```typescript
// DocumentTypeRightList
{
  moduleCode: 'PO',
  userName: string
}

// POHeaderList
{
  documentTypeCode: string,  // จาก dropdown
  // ... other filters
}
```

---

## 3. PO Form Page Flow (Create/Edit)

```mermaid
flowchart TD
    A[เข้าหน้า PO Form] --> B{Mode?}

    B -->|Create| C[เรียก APIs สำหรับ dropdown]
    B -->|Edit| D[เรียก PODetail API]

    C --> E[SeriesAndGroupDoc API]
    C --> F[GetVendor API]
    C --> G[GetSupplier API]

    D --> H[Load ข้อมูล PO เดิม]
    H --> E

    E --> I[แสดง Form]
    F --> I
    G --> I

    I --> J{User action?}
    J -->|เลือก Vendor| K[GetVendorDetail API]
    J -->|เพิ่ม Line Item| L[SearchItem API]
    J -->|บันทึก| M{Create or Edit?}

    M -->|Create| N[POInsert API]
    M -->|Edit| O[POUpdate API]

    N --> P[Redirect to PO List]
    O --> P
```

### APIs ที่เกี่ยวข้อง

| Trigger | API | Method | หน้าที่ |
|---------|-----|--------|--------|
| เข้าหน้า | `/api/Series/SeriesAndGroupDoc` | GET | ดึง Series สำหรับเลขที่เอกสาร |
| เข้าหน้า | `/api/Vendor/GetVendor` | GET | ดึงรายชื่อ Vendor |
| เข้าหน้า | `/api/Supplier/GetSupplier` | GET | ดึงรายชื่อ Supplier |
| Edit Mode | `/api/POHeader/PODetail` | GET | ดึงรายละเอียด PO |
| เลือก Vendor | `/api/Vendor/GetVendorDetail` | GET | ดึงรายละเอียด Vendor |
| เพิ่ม Item | `/api/Item/SearchItem` | GET | ค้นหาสินค้า |
| บันทึก (Create) | `/api/POHeader/POInsert` | POST | สร้าง PO ใหม่ |
| บันทึก (Edit) | `/api/POHeader/POUpdate` | PUT | แก้ไข PO |

---

## 4. Logout Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as Portal
    participant PO as PO Module
    participant LS as LocalStorage

    U->>P: 1. กด Logout
    P->>LS: 2. Clear tokens
    P->>P: 3. Dispatch 'qerp:logout' event
    PO->>PO: 4. Listen event → Reset Zustand store
    P->>P: 5. Redirect to Login
```

### สิ่งที่ต้อง Clear ตอน Logout

| ที่เก็บ | ข้อมูล | ใครเป็นคน Clear |
|--------|--------|-----------------|
| localStorage | accessToken, permission, username | Portal (authService.logout) |
| AuthContext | isAuthenticated, tokens | Portal (setState) |
| PO Zustand Store | documentTypes, poHeaders | PO Module (listen event) |

---

## 5. State Management

### Zustand Store Structure

```typescript
// poStore
{
  documentTypes: DocumentType[]      // Cache - โหลดครั้งเดียว
  selectedDocumentTypeCode: string   // User selection
  poHeaders: POHeader[]              // List data
  isLoadingDocTypes: boolean
  isLoadingPOHeaders: boolean
  searchText: string
}
```

### Cache Strategy

| Data | Cache Location | Invalidate เมื่อ |
|------|---------------|------------------|
| documentTypes | Zustand store | Logout, เปลี่ยน Company |
| poHeaders | Zustand store | เปลี่ยน documentType, Refresh |
| Vendor list | React Query (ถ้ามี) | - |

---

## 6. API Response Format

### Standard Response

```typescript
interface ApiResponse<T> {
  code: number      // 0 = success
  msg: string | null
  result: T | null
}
```

### Error Codes

| Code | ความหมาย |
|------|----------|
| 0 | สำเร็จ |
| 1 | ข้อมูลไม่ถูกต้อง |
| 2 | ไม่มีสิทธิ์ |
| 401 | Token หมดอายุ |

---

## 7. File References

| หน้าที่ | ไฟล์ |
|--------|------|
| PO List Page | `src/pages/POList.tsx` |
| PO Form Page | `src/pages/POForm.tsx` |
| PO List Hook | `src/hooks/usePOListData.ts` |
| PO Form Hook | `src/hooks/usePOFormData.ts` |
| Zustand Store | `src/stores/poStore.ts` |
| API Services | `src/services/*.ts` |

---

*อัพเดทล่าสุด: 8 มกราคม 2026*
