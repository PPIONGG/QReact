# React TypeScript Microfrontend with Module Federation

โปรเจคนี้เป็น Microfrontend Architecture ที่ใช้ Module Federation สร้างด้วย React TypeScript และ Vite

---

## 📋 สารบัญ

- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [คุณสมบัติ](#คุณสมบัติ)
- [Quick Start](#quick-start)
- [วิธีการใช้งาน](#วิธีการใช้งาน)
- [การส่งข้อมูลระหว่าง Host และ Remote](#การส่งข้อมูลระหว่าง-host-และ-remote)
- [Module Federation Configuration](#module-federation-configuration)
- [การพัฒนา](#การพัฒนา)
- [Production Build](#production-build)
- [เอกสารเพิ่มเติม](#เอกสารเพิ่มเติม)

---

## 🏗️ โครงสร้างโปรเจค

```
.
├── package.json              # Root workspace scripts
├── README.md                 # เอกสารหลัก (ไฟล์นี้)
├── RUN_INSTRUCTIONS.md       # คำแนะนำการรันโดยละเอียด
├── DATA_SHARING.md          # วิธีการส่งข้อมูลระหว่าง Host-Remote
│
├── portal/                   # Portal Application (Port 5000)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx           # หน้า Login
│   │   │   ├── Login.css
│   │   │   ├── Main.tsx            # หน้า Main (โหลด Remote)
│   │   │   └── Main.css
│   │   ├── App.tsx                 # Router setup
│   │   ├── App.css
│   │   └── vite-env.d.ts          # Type declarations
│   ├── vite.config.ts              # Module Federation Config
│   └── package.json
│
└── sales-visitor/            # Remote Application (Port 5001)
    ├── src/
    │   ├── App.tsx                 # Remote Component (Exposed)
    │   ├── App.css
    │   └── main.tsx                # Standalone entry point
    ├── vite.config.ts              # Module Federation Config
    ├── package.json
    ├── DEVELOPMENT.md              # คำแนะนำสำหรับทีม Remote
    └── dist/                       # Build output
        └── assets/
            └── remoteEntry.js      # Module Federation entry
```

---

## ✨ คุณสมบัติ

### Portal Application (port 5000)
- ✅ หน้า Login พร้อม authentication
- ✅ หน้า Main ที่โหลด Remote Module
- ✅ React Router สำหรับ navigation
- ✅ ส่ง props (username, userId, role) ไปยัง Remote
- ✅ Hot Reload สำหรับ Portal code

### Remote Application - Sales Visitor (port 5001)
- ✅ Component แสดงรายการนัดหมาย Sales Visitor
- ✅ รับ props จาก Portal
- ✅ Expose ผ่าน Module Federation
- ✅ พัฒนาแบบ Standalone ได้ (มี Hot Reload)
- ✅ Watch mode สำหรับ Integration testing

---

## 🚀 Quick Start

### วิธีที่ 1: รันทั้งหมดพร้อมกัน (แนะนำ!)

```bash
# ที่ root folder
npm run dev
```

เปิดเบราว์เซอร์: http://localhost:5000

### วิธีที่ 2: รันแยก 2 Terminal

**Terminal 1: Remote**
```bash
cd sales-visitor
npm run dev:integrated
```

**Terminal 2: Portal**
```bash
cd portal
npm run dev
```

เปิดเบราว์เซอร์: http://localhost:5000

---

## 📖 วิธีการใช้งาน

### 1. ติดตั้ง Dependencies (ครั้งแรก)

```bash
# ติดตั้งทั้งหมดพร้อมกัน
npm run install:all

# หรือติดตั้งแยก
cd portal && npm install
cd sales-visitor && npm install
```

### 2. Development

```bash
# รันทั้งหมด
npm run dev
```

### 3. ทดสอบระบบ

1. เปิดเบราว์เซอร์: http://localhost:5000
2. จะเห็นหน้า Login
3. กรอกชื่อผู้ใช้และรหัสผ่านอะไรก็ได้ (เช่น "admin" / "1234")
4. กด "เข้าสู่ระบบ"
5. จะถูก redirect ไปหน้า Main ที่ http://localhost:5000/main
6. จะเห็น Remote Module (sales-visitor) โหลดมาแสดงพร้อมข้อมูล user

---

## 🔄 การส่งข้อมูลระหว่าง Portal และ Remote

### Portal ส่ง Props ไปยัง Remote:

```typescript
// portal/src/pages/Main.tsx
<SalesVisitorApp
  username={username}
  userId="USER-12345"
  role="Sales Manager"
/>
```

### Remote รับ Props:

```typescript
// sales-visitor/src/App.tsx
interface AppProps {
  username?: string
  userId?: string
  role?: string
}

function App({ username, userId, role }: AppProps = {}) {
  // ใช้ props ได้เลย
  return <div>Welcome {username}</div>
}
```

**ดูรายละเอียดเพิ่มเติม:** [DATA_SHARING.md](DATA_SHARING.md)

---

## ⚙️ Module Federation Configuration

### Portal Configuration

```typescript
// portal/vite.config.ts
federation({
  name: 'portal',
  remotes: {
    salesVisitor: 'http://localhost:5001/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

### Remote Configuration

```typescript
// sales-visitor/vite.config.ts
federation({
  name: 'salesVisitor',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',  // Expose component
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

---

## 💻 การพัฒนา

### แก้ไข Portal Code:
```bash
# รันโหมด dev
npm run dev

# แก้ไฟล์ใน portal/src/
# บันทึก → Hot reload ทันที ✅
```

### แก้ไข Remote Code:

**แบบที่ 1: Standalone (มี Hot Reload)**
```bash
cd sales-visitor
npm run dev  # หรือ npm run dev:standalone

# เปิด http://localhost:5001
# แก้โค้ด → บันทึก → เห็นผลทันที ✅
```

**แบบที่ 2: Integration Testing (ทดสอบกับ Portal)**
```bash
# รัน Remote ใน watch mode
cd sales-visitor
npm run dev:integrated

# แก้โค้ด → รอ build 1-2 วินาที → Refresh browser (Ctrl+Shift+R)
```

**Tips:** เปิด DevTools (F12) → Tab Network → เช็ค "Disable cache" จะได้ไม่ต้อง hard refresh

---

## 🏗️ Production Build

### Build ทั้งหมด:

```bash
npm run build
```

### Preview:

```bash
npm run preview
```

เปิดเบราว์เซอร์: http://localhost:5000

### Deploy:

1. **Build Remote:**
   ```bash
   cd sales-visitor
   npm run build
   # Upload dist/ ไปยัง CDN/Server
   ```

2. **Update Portal Config:**
   ```typescript
   remotes: {
     salesVisitor: 'https://cdn.example.com/sales-visitor/assets/remoteEntry.js'
   }
   ```

3. **Build Portal:**
   ```bash
   cd portal
   npm run build
   # Upload dist/ ไปยัง hosting
   ```

---

## 📦 Available Scripts (Root Level)

| Script | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน Remote + Portal พร้อมกัน (Development) |
| `npm run build` | Build ทั้ง Remote และ Portal |
| `npm run preview` | Preview production build |
| `npm run install:all` | ติดตั้ง dependencies ทั้งหมด |

---

## 🎯 การเพิ่ม Remote Module ใหม่

1. **สร้างโปรเจค React TypeScript:**
   ```bash
   npm create vite@latest my-remote -- --template react-ts
   ```

2. **ติดตั้ง Module Federation:**
   ```bash
   npm install @originjs/vite-plugin-federation --save-dev
   ```

3. **Config vite.config.ts:**
   ```typescript
   federation({
     name: 'myRemote',
     filename: 'remoteEntry.js',
     exposes: {
       './App': './src/App.tsx'
     },
     shared: ['react', 'react-dom']
   })
   ```

4. **เพิ่มใน Portal:**
   ```typescript
   // portal/vite.config.ts
   remotes: {
     myRemote: 'http://localhost:5002/assets/remoteEntry.js'
   }

   // portal/src/vite-env.d.ts
   declare module 'myRemote/App' {
     const App: React.ComponentType
     export default App
   }
   ```

5. **ใช้งาน:**
   ```typescript
   const MyRemoteApp = lazy(() => import('myRemote/App'))
   <MyRemoteApp />
   ```

---

## 📚 เอกสารเพิ่มเติม

- **[RUN_INSTRUCTIONS.md](RUN_INSTRUCTIONS.md)** - คำแนะนำการรันโดยละเอียด, Hot reload, Watch mode
- **[DATA_SHARING.md](DATA_SHARING.md)** - วิธีการส่งข้อมูลระหว่าง Host และ Remote (Props, Context, Events)
- **[sales-visitor/DEVELOPMENT.md](sales-visitor/DEVELOPMENT.md)** - คำแนะนำสำหรับทีมพัฒนา Remote
- [Vite Module Federation Plugin](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Concepts](https://webpack.js.org/concepts/module-federation/)

---

## 🔧 เทคโนโลジีที่ใช้

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Module Federation** - Microfrontend Architecture
- **React Router DOM** - Client-side Routing
- **@originjs/vite-plugin-federation** - Module Federation for Vite

---

## 💡 Best Practices

### ✅ DO:
- Build Remote ก่อนเสมอเมื่อต้องการ integrate
- ใช้ TypeScript interfaces สำหรับ props
- Validate props ใน Remote
- เขียน error boundary สำหรับ Remote components
- ใช้ version tag สำหรับ Remote URLs ใน production

### ❌ DON'T:
- ส่ง sensitive data (password, token) ผ่าน props
- Deploy Remote โดยไม่ระบุ version
- ใช้ localhost URLs ใน production
- ลืม update Type declarations เมื่อเปลี่ยน interface

---

## 🐛 Troubleshooting

### Remote ไม่โหลด (404 Error):
```bash
# ตรวจสอบว่า Remote รันอยู่
curl http://localhost:5001/assets/remoteEntry.js

# Build Remote ใหม่
cd sales-visitor
npm run build
npm run preview
```

### Type Errors:
```bash
# Restart TypeScript server ใน VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# หรือ restart dev server
```

### Module Federation Error:
- ตรวจสอบ shared dependencies มี version ตรงกันหรือไม่
- ตรวจสอบ Remote URL ถูกต้อง
- ดู Console log สำหรับ error details

---

## 📝 หมายเหตุ

- Remote **ต้องรันก่อน** Portal เสมอ
- สำหรับ Production ควรใช้ CDN URL แทน localhost
- ตรวจสอบ CORS settings ถ้าใช้ domain ต่างกัน
- ใช้ `npm run dev` ที่ root สำหรับการพัฒนาปกติ

---

## 🙋 คำถามที่พบบ่อย

**Q: Hot reload ทำงานไหม?**
A: Portal มี hot reload แต่ Remote ต้อง refresh browser หลัง build (หรือใช้ standalone mode)

**Q: ส่งข้อมูลระหว่าง Portal-Remote ยังไง?**
A: ใช้ Props (แนะนำ), Context API, หรือ Custom Events - ดูใน [DATA_SHARING.md](DATA_SHARING.md)

**Q: Deploy ยังไง?**
A: Build Remote → upload ไป CDN → update Portal config → build Portal → deploy Portal

**Q: เพิ่ม Remote module ใหม่ยังไง?**
A: ดูขั้นตอนใน [การเพิ่ม Remote Module ใหม่](#การเพิ่ม-remote-module-ใหม่)

---

## 🎉 Happy Coding!

สร้างโดย Claude Code
Module Federation + React + TypeScript + Vite
