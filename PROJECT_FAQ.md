# Project FAQ - คำถามและข้อสงสัยเกี่ยวกับโปรเจค

## โปรเจคนี้คืออะไร?

**QReact** คือ ERP Portal ที่ออกแบบเป็น Microfrontend Architecture โดยใช้ Vite เป็น bundler และใช้ Module Federation plugin เพื่อโหลด remote modules แบบ runtime

### อธิบายแบบง่าย

> "โปรเจคนี้แยก Frontend เป็นหลายแอปย่อย (Portal, Sales, Purchase) แต่ละแอป deploy แยกกันได้ แล้วมารวมกันตอนรันเป็นแอปเดียว"

---

## คำศัพท์สำคัญ

### Microfrontend คืออะไร?

**Microfrontend** (ไมโครฟรอนท์เอนด์) คือ **"สถาปัตยกรรม" (Architecture Pattern)** ในการออกแบบ Frontend

เหมือน Microservices แต่ฝั่ง Frontend:

```
Microservices   = แยก Backend เป็นหลายๆ service
Microfrontend   = แยก Frontend เป็นหลายๆ app
```

| | **Monolith** | **Microfrontend** |
|---|---|---|
| **โครงสร้าง** | แอปเดียวใหญ่ๆ | หลายแอปเล็กๆ รวมกัน |
| **ทีม** | ทีมเดียวดูแลทั้งหมด | แต่ละทีมดูแลแต่ละส่วน |
| **Deploy** | Deploy ทีเดียวทั้งก้อน | Deploy แยกกันได้ |

---

### Module Federation คืออะไร?

**Module Federation** คือ **"Plugin ของ Bundler"** ที่ช่วยทำ Microfrontend

- ใน **Webpack 5+** = Built-in feature (ModuleFederationPlugin)
- ใน **Vite** = Plugin (`@originjs/vite-plugin-federation`)

#### วิธีทำงาน

1. **Build time** - แต่ละโมดูลสร้าง `remoteEntry.js` (manifest file)
2. **Runtime** - Portal โหลด `remoteEntry.js` จาก URL ของ Remote
3. **Dynamic Import** - Portal ดึง Component มาใช้แบบ dynamic

#### Module Federation ไม่ใช่ Library

| | **Library (npm package)** | **Module Federation** |
|---|---|---|
| **เวลา** | Build time | **Runtime** |
| **วิธีใช้** | `npm install` แล้ว build รวม | โหลดจาก URL ตอนรันแอป |
| **อัปเดต** | ต้อง install ใหม่ + rebuild | **อัปเดตทันที** ไม่ต้อง rebuild host |
| **Deploy** | Deploy พร้อมกัน | **Deploy แยกกันได้** |

---

### Bundler คืออะไร?

**Bundler** (บันเดิลเลอร์) คือเครื่องมือที่ **รวมไฟล์โค้ดหลายๆ ไฟล์ให้เป็นไฟล์เดียว** เพื่อให้ Browser โหลดได้เร็วขึ้น

```
ไฟล์เป็นร้อยๆ ไฟล์  →  [Bundler]  →  ไฟล์ไม่กี่ไฟล์

src/**/*.tsx                         dist/
node_modules/**          →           ├── index.html
                                     ├── main.js
                                     └── style.css
```

#### Bundler ยอดนิยม

| Bundler | ลักษณะ |
|---------|--------|
| **Vite** | เร็วมาก, ใช้ในโปรเจคนี้ |
| **Webpack** | เก่าแก่, ฟีเจอร์เยอะ |
| **Rollup** | เหมาะทำ Library |
| **esbuild** | เร็วสุดๆ |

---

## สรุป Keywords

| คำ | คือ | ประเภท |
|---|---|---|
| **Microfrontend** | แนวคิดแยก Frontend เป็นหลายแอป | Architecture Pattern |
| **Module Federation** | เครื่องมือทำ Microfrontend | Bundler Plugin/Feature |
| **Vite** | ตัว build โค้ด | Bundler |
| **Monorepo** | หลาย package ใน repo เดียว | Project Structure |

---

## วิธีทำ Microfrontend

Microfrontend ทำได้หลายวิธี:

| วิธี | เครื่องมือ |
|------|-----------|
| **Module Federation** | Webpack, Vite plugin |
| **iframe** | HTML ธรรมดา |
| **Web Components** | Custom Elements |
| **Build-time integration** | npm package |

โปรเจคนี้เลือกใช้ **Module Federation** เพราะ:
- Deploy แยกกันได้
- โหลด module แบบ dynamic
- แชร์ dependencies ได้ (React, Antd โหลดครั้งเดียว)

---

## โครงสร้างโปรเจค

```
QReact (Monorepo)
├── portal/                      # Host App (Port 5000)
├── Q-ERPc/
│   ├── sales/sales-visitor/     # Remote Module (Port 5001)
│   └── purchase/purchase-order/ # Remote Module (Port 5002)
└── shared/                      # Shared utilities (@qerp/shared)
```

| โมดูล | Port | หน้าที่ |
|-------|------|--------|
| **Portal** | 5000 | Host app, Authentication, Navigation |
| **Sales Visitor** | 5001 | จัดการการนัดหมายลูกค้า |
| **Purchase Order** | 5002 | ระบบใบสั่งซื้อ (สร้าง/แก้ไข/ดู/พิมพ์) |

---

## เทคโนโลยีหลัก

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Bundler
- **Module Federation** - Microfrontend
- **Ant Design** - UI Components
- **Zustand** - State Management

---

## Host vs Remote

### Host (Portal) คืออะไร?

**Host** คือแอปหลักที่ทำหน้าที่ **"โหลด"** Remote Modules เข้ามาแสดง

```
┌─────────────────────────────────────────────────────┐
│                 HOST (Portal)                        │
│                 Port 5000                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  - Authentication (Login/Logout)              │  │
│  │  - Navigation (Sidebar, Menu)                 │  │
│  │  - โหลด Remote Modules                        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Remote คืออะไร?

**Remote** คือแอปย่อยที่ถูก **"โหลดเข้ามา"** โดย Host

```
┌──────────────────┐    ┌──────────────────┐
│  Sales Visitor   │    │  Purchase Order  │
│  (Remote)        │    │  (Remote)        │
│  Port 5001       │    │  Port 5002       │
└──────────────────┘    └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
            ┌────────────────┐
            │     Portal     │
            │     (Host)     │
            │   Port 5000    │
            └────────────────┘
```

### เปรียบเทียบ Host vs Remote

| | **Host (Portal)** | **Remote (Sales, Purchase)** |
|---|---|---|
| **หน้าที่** | โหลด Remote เข้ามา | ถูกโหลดโดย Host |
| **Config** | กำหนด `remotes: {...}` | กำหนด `exposes: {...}` |
| **รันแยกได้** | ได้ | ได้ (Standalone mode) |
| **ต้องรันก่อน** | ไม่ | **ใช่** (ต้องรันก่อน Host) |

---

## Shared Dependencies

### ทำไมต้องแชร์ Dependencies?

ถ้าไม่แชร์ React, Antd แต่ละ Remote จะโหลด React ของตัวเอง:

```
❌ ไม่แชร์:
Portal    → React (500KB)
Sales     → React (500KB)  ← ซ้ำ!
Purchase  → React (500KB)  ← ซ้ำ!
                    รวม 1.5MB
```

```
✅ แชร์:
Portal    → React (500KB)  ← โหลดครั้งเดียว
Sales     → ใช้ React จาก Portal
Purchase  → ใช้ React จาก Portal
                    รวม 500KB
```

### วิธี Config Shared

```typescript
// vite.config.ts (ทั้ง Host และ Remote)
federation({
  shared: ['react', 'react-dom', 'react-router-dom', 'antd']
})
```

### ข้อควรระวัง

- Version ของ shared dependencies ควรตรงกัน
- ถ้า version ไม่ตรง อาจเกิด error หรือ behavior แปลกๆ

---

## Props Passing (การส่งข้อมูล Host → Remote)

### วิธีส่งข้อมูลจาก Portal ไป Remote

**1. Portal ส่ง Props:**

```typescript
// portal/src/pages/Main.tsx
<PurchaseOrderApp
  username={username}
  accessToken={accessToken}
  companyCode={companyCode}
  permission={permission}
/>
```

**2. Remote รับ Props:**

```typescript
// purchase-order/src/App.tsx
interface AppProps {
  username?: string
  accessToken?: string
  companyCode?: string
  permission?: Permission | null
}

function App({ username, accessToken, companyCode, permission }: AppProps) {
  // ใช้งาน props ได้เลย
  return <div>Welcome {username}</div>
}
```

### ข้อมูลที่ส่งในโปรเจคนี้

| Props | ประเภท | ใช้ทำอะไร |
|-------|--------|-----------|
| `username` | string | แสดงชื่อผู้ใช้ |
| `accessToken` | string | ใช้เรียก API |
| `companyCode` | string | ระบุบริษัทที่ใช้งาน |
| `permission` | object | ตรวจสอบสิทธิ์ (create/edit/delete) |

---

## Lazy Loading

### Lazy Loading คืออะไร?

**Lazy Loading** คือการ **โหลด module เมื่อต้องการใช้** แทนที่จะโหลดทั้งหมดตั้งแต่แรก

```typescript
// ❌ โหลดทันที (Eager Loading)
import PurchaseOrderApp from 'purchaseOrder/App'

// ✅ โหลดเมื่อต้องการ (Lazy Loading)
const PurchaseOrderApp = React.lazy(() => import('purchaseOrder/App'))
```

### ข้อดีของ Lazy Loading

```
เปิดหน้า Login:
├── โหลด Portal           ✅ (โหลด)
├── โหลด Sales Visitor    ❌ (ยังไม่โหลด)
└── โหลด Purchase Order   ❌ (ยังไม่โหลด)

เข้าหน้า Purchase Order:
├── โหลด Portal           ✅ (โหลดแล้ว)
├── โหลด Sales Visitor    ❌ (ยังไม่โหลด)
└── โหลด Purchase Order   ✅ (โหลดตอนนี้!)
```

### ใช้กับ Suspense

```typescript
<Suspense fallback={<div>Loading...</div>}>
  <PurchaseOrderApp />
</Suspense>
```

`Suspense` จะแสดง "Loading..." ระหว่างรอโหลด Remote Module

---

## Monorepo

### Monorepo คืออะไร?

**Monorepo** (โมโนรีโป) คือการเก็บ **หลาย package/project ไว้ใน repository เดียว**

```
QReact/                          ← 1 Repository
├── portal/                      ← Package 1
├── Q-ERPc/sales/sales-visitor/  ← Package 2
├── Q-ERPc/purchase/purchase-order/ ← Package 3
├── shared/                      ← Package 4
└── package.json                 ← Root workspace
```

### เปรียบเทียบ Monorepo vs Multi-repo

| | **Monorepo** | **Multi-repo** |
|---|---|---|
| **Repository** | 1 repo | หลาย repo |
| **แชร์โค้ด** | ง่าย | ต้องผ่าน npm |
| **Version control** | ที่เดียว | แยกกัน |
| **CI/CD** | ซับซ้อนกว่า | แยกกัน |

### npm Workspaces

โปรเจคนี้ใช้ **npm workspaces** จัดการ Monorepo:

```json
// package.json (root)
{
  "workspaces": [
    "portal",
    "Q-ERPc/sales/sales-visitor",
    "Q-ERPc/purchase/purchase-order",
    "shared"
  ]
}
```

**ข้อดี:**
- `npm install` ครั้งเดียว ติดตั้งทุก package
- แชร์ dependencies ได้
- รัน script ข้าม package ได้

---

## remoteEntry.js คืออะไร?

### remoteEntry.js คือ "สารบัญ" ของ Remote Module

เมื่อ build Remote Module จะได้ไฟล์ `remoteEntry.js` ที่บอกว่า:
- Module นี้ชื่ออะไร
- มี Component อะไรให้ใช้บ้าง
- ไฟล์ต่างๆ อยู่ที่ไหน

```
dist/
├── assets/
│   ├── remoteEntry.js      ← ไฟล์สารบัญ
│   ├── App-abc123.js       ← Component จริง
│   └── vendor-xyz789.js    ← Dependencies
└── index.html
```

### วิธีทำงาน

```
1. Host ต้องการโหลด Purchase Order
          │
          ▼
2. Host โหลด remoteEntry.js จาก
   http://localhost:5002/assets/remoteEntry.js
          │
          ▼
3. remoteEntry.js บอกว่า:
   - ชื่อ: purchaseOrder
   - App อยู่ที่: ./App-abc123.js
          │
          ▼
4. Host โหลด App-abc123.js มาใช้
          │
          ▼
5. แสดง Purchase Order ใน Portal
```

### Config ที่เกี่ยวข้อง

**Remote (สร้าง remoteEntry.js):**
```typescript
federation({
  name: 'purchaseOrder',
  filename: 'remoteEntry.js',  // ← ชื่อไฟล์
  exposes: {
    './App': './src/App.tsx'   // ← Component ที่เปิดให้ใช้
  }
})
```

**Host (โหลด remoteEntry.js):**
```typescript
federation({
  remotes: {
    purchaseOrder: 'http://localhost:5002/assets/remoteEntry.js'
  }
})
```

---

## สรุปการทำงานทั้งหมด

```
┌─────────────────────────────────────────────────────────────────┐
│                         User เปิด Browser                        │
│                     http://localhost:5000                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Portal (Host) โหลด                          │
│                      - Login Page                                │
│                      - Navigation                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                         User เข้าหน้า PO
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Portal โหลด remoteEntry.js                          │
│         จาก http://localhost:5002/assets/remoteEntry.js         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Purchase Order Module โหลดเข้ามา                    │
│              - รับ props (username, token, etc.)                │
│              - แสดง UI ใน Portal                                 │
└─────────────────────────────────────────────────────────────────┘
```
