# Deploy Guide - QReact to IIS (Sub-folder)

## Server Configuration

| ประเภท | URL/Path |
|--------|----------|
| API Server | `http://192.168.0.131:1003` |
| UI Server | `http://192.168.0.131:1005` |
| IIS Path | `C:\inetpub\Web PO` |

## โครงสร้างหลัง Deploy

```
C:\inetpub\Web PO\              (IIS Site - Port 1005)
│
├── index.html                  → Portal (หน้าหลัก)
├── assets/
├── web.config
│
└── po\                         → Purchase Order (Sub-folder)
    ├── index.html
    ├── assets\
    │   └── remoteEntry.js      ← Module Federation
    └── web.config
```

## URL หลัง Deploy

| App | URL |
|-----|-----|
| Portal | `http://192.168.0.131:1005/` |
| Purchase Order | `http://192.168.0.131:1005/po/` |
| Remote Entry | `http://192.168.0.131:1005/po/assets/remoteEntry.js` |

---

## ขั้นตอน Deploy

### 1. ตรวจสอบ URL ใน vite.config.prod.ts

URL ได้ถูกตั้งค่าไว้แล้วใน `portal/vite.config.prod.ts`:

```typescript
const PRODUCTION_URL = 'http://192.168.0.131:1005'  // ✅ ตั้งค่าแล้ว
```

### 2. Build โปรเจค

**วิธีที่ 1: ใช้ Script (แนะนำ)**

```bash
# รัน script
build-prod.bat

# เลือก:
# 1 = Build ทั้งหมด
# 2 = Build เฉพาะ Portal
# 3 = Build เฉพาะ PO
```

**วิธีที่ 2: รัน Command**

```bash
# Build ทั้งหมด
build-prod.bat all

# Build แยก
build-prod.bat portal
build-prod.bat po
```

### 3. ไฟล์พร้อม Deploy

หลัง build ไฟล์จะอยู่ที่ `deploy/output/`:

```
deploy/output/
├── index.html          (Portal)
├── assets/             (Portal assets)
├── web.config          (Portal IIS config)
└── po/                 (Purchase Order)
    ├── index.html
    ├── assets/
    │   └── remoteEntry.js
    └── web.config
```

### 4. Copy ไปยัง IIS

**วิธีที่ 1: ใช้ Script (แนะนำ)**
```bash
build-prod.bat
# เลือก 4 = Copy ไป IIS
# หรือเลือก 5 = Build ทั้งหมด + Copy ไป IIS
```

**วิธีที่ 2: Copy Manual**
1. Copy ทั้งโฟลเดอร์ `deploy/output/*` ไปยัง `C:\inetpub\Web PO\`

2. โครงสร้างใน IIS:
```
C:\inetpub\Web PO\
├── index.html
├── assets\
├── web.config
└── po\
    ├── index.html
    ├── assets\
    └── web.config
```

---

## ตั้งค่า IIS

### สร้าง Site ใหม่

1. เปิด **IIS Manager**
2. คลิกขวาที่ **Sites** → **Add Website**
3. กรอกข้อมูล:
   - Site name: `Web PO`
   - Physical path: `C:\inetpub\Web PO`
   - Port: `1005`

### ติดตั้ง URL Rewrite Module

**สำคัญ!** ต้องติดตั้ง URL Rewrite Module ก่อน:

1. ดาวน์โหลด: https://www.iis.net/downloads/microsoft/url-rewrite
2. ติดตั้ง
3. Restart IIS

### ตรวจสอบ MIME Types

ตรวจสอบว่า IIS รองรับ `.js` files:
1. เปิด IIS Manager
2. เลือก Site
3. ดับเบิลคลิก **MIME Types**
4. ตรวจสอบว่ามี `.js` → `application/javascript`

---

## Troubleshooting

### ปัญหา: 404 Not Found เมื่อ Refresh หน้า

**สาเหตุ:** URL Rewrite ไม่ทำงาน

**แก้ไข:**
1. ตรวจสอบว่าติดตั้ง URL Rewrite Module แล้ว
2. ตรวจสอบว่า web.config อยู่ในโฟลเดอร์

### ปัญหา: Remote Module โหลดไม่ได้ (CORS Error)

**สาเหตุ:** CORS headers ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ web.config มี CORS headers
2. ตรวจสอบ URL ใน vite.config.prod.ts ถูกต้อง

### ปัญหา: JavaScript ไม่โหลด

**สาเหตุ:** MIME Type ไม่ถูกต้อง

**แก้ไข:**
1. เพิ่ม MIME Type `.js` → `application/javascript` ใน IIS
2. หรือใช้ web.config ที่ให้มา (มี MIME Type แล้ว)

### ปัญหา: Assets โหลดไม่ได้ (base path ผิด)

**สาเหตุ:** `base` ใน vite.config ไม่ตรงกับ path บน server

**แก้ไข:**
- Portal: `base: '/'`
- PO: `base: '/po/'`

---

## ตัวอย่าง URL ที่ถูกต้อง

หลัง Deploy แล้ว ควรเข้าถึงได้:

```
✅ http://192.168.0.131:1005/                    → Portal
✅ http://192.168.0.131:1005/login               → Portal (React Router)
✅ http://192.168.0.131:1005/assets/index-xxx.js → Portal JS
✅ http://192.168.0.131:1005/po/                 → PO Standalone
✅ http://192.168.0.131:1005/po/assets/remoteEntry.js → Module Federation
```

---

## Checklist ก่อน Deploy

- [ ] ตรวจสอบ `PRODUCTION_URL` ใน `portal/vite.config.prod.ts` (ปัจจุบัน: `http://192.168.0.131:1005`)
- [ ] รัน `build-prod.bat` เลือก 1 หรือ 5 (Build ทั้งหมด)
- [ ] ติดตั้ง URL Rewrite Module ใน IIS
- [ ] สร้าง Site ใน IIS (Port 1005, Path: `C:\inetpub\Web PO`)
- [ ] Copy `deploy/output/*` ไปยัง `C:\inetpub\Web PO\` (หรือใช้ option 4/5 ใน script)
- [ ] ทดสอบเปิด `http://192.168.0.131:1005/`
- [ ] ทดสอบ refresh หน้า (URL Rewrite ทำงาน)
- [ ] ทดสอบเข้าหน้า PO `http://192.168.0.131:1005/po/` (Module Federation ทำงาน)
