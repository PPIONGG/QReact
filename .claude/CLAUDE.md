# Q-ERP Project Rules

## Project Overview
โปรเจค Q-ERP เป็น Micro-Frontend ERP System ที่ใช้ React + TypeScript + Vite + Module Federation

## Project Structure
```
QReact/
├── shared/                    # 📦 Shared Module (ใช้ร่วมกันทุก module)
│   └── src/
│       ├── components/        # Shared UI components (Modal, Table, etc.)
│       ├── hooks/             # Shared hooks
│       ├── services/          # httpClient และ shared services
│       ├── types/             # Shared types (ApiResponse, etc.)
│       └── utils/             # Shared utilities
├── general/                   # General modules (ไม่ใช่ ERP)
│   └── dashboard/             # Dashboard Microfrontend
├── Q-ERPc/                    # ERP Modules
│   ├── purchase/              # Purchase Module
│   │   └── purchase-order/    # PO Microfrontend
│   └── sales/                 # Sales Module
│       └── sales-visitor/     # Sales Visitor Microfrontend
└── portal/                    # Host Application
```

---

## 📦 Shared Module (แผนในอนาคต)

### หลักการ: เมื่อไหร่ควรย้ายไป shared?
- ใช้ซ้ำ **มากกว่า 2 modules** → ย้ายไป shared
- เป็น **business logic กลาง** ที่ทุก module ต้องใช้
- เป็น **UI component** ที่หน้าตาเหมือนกันทุกที่

### โครงสร้าง shared ที่วางแผนไว้
```
shared/
└── src/
    ├── components/           # 🎨 Shared UI Components
    │   ├── DataTable/        # Table component พร้อม pagination, sorting
    │   ├── ConfirmModal/     # Modal ยืนยันการทำรายการ
    │   ├── SearchModal/      # Modal ค้นหาข้อมูล (Vendor, Item, etc.)
    │   ├── StatusTag/        # Tag แสดง status ต่างๆ
    │   └── index.ts
    │
    ├── hooks/                # 🔗 Shared Hooks
    │   ├── useDebounce.ts    # Debounce สำหรับ search
    │   ├── usePagination.ts  # Pagination logic
    │   ├── useLocalStorage.ts
    │   └── index.ts
    │
    ├── services/             # 🌐 Shared Services (มีอยู่แล้ว)
    │   ├── httpClient.ts     # Axios wrapper
    │   └── index.ts
    │
    ├── types/                # 📝 Shared Types (มีอยู่แล้ว)
    │   ├── api.ts            # ApiResponse, PaginatedResponse
    │   ├── common.ts         # Common types
    │   └── index.ts
    │
    └── utils/                # 🔧 Shared Utilities
        ├── formatters.ts     # formatDate, formatNumber, formatCurrency
        ├── validators.ts     # validation functions
        └── index.ts
```

### ตัวอย่าง Shared Components ที่จะสร้าง

#### 1. DataTable - Table มาตรฐาน
```typescript
// ใช้แทน Ant Design Table เพื่อให้ทุก module หน้าตาเหมือนกัน
<DataTable
  columns={columns}
  dataSource={data}
  loading={isLoading}
  pagination={{ current, pageSize, total }}
  onPaginationChange={handlePageChange}
  rowSelection={rowSelection}  // optional
/>
```

#### 2. SearchModal - Modal ค้นหาข้อมูล
```typescript
// ใช้ค้นหา Vendor, Item, Customer ฯลฯ
<SearchModal
  title="ค้นหาผู้ขาย"
  visible={isOpen}
  onSelect={handleSelect}
  searchService={vendorService.search}  // ส่ง service function เข้าไป
  columns={vendorColumns}
/>
```

#### 3. ConfirmModal - Modal ยืนยัน
```typescript
// ใช้ยืนยันการลบ, อนุมัติ, ยกเลิก ฯลฯ
<ConfirmModal
  title="ยืนยันการลบ"
  message="ต้องการลบรายการนี้หรือไม่?"
  type="danger"  // 'danger' | 'warning' | 'info'
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### วิธีใช้ shared ใน module อื่น
```typescript
// import จาก shared package
import { DataTable, SearchModal, ConfirmModal } from 'shared/components'
import { useDebounce, usePagination } from 'shared/hooks'
import { formatDate, formatCurrency } from 'shared/utils'
```

### 📋 Checklist ก่อนย้ายไป shared
- [ ] ใช้ซ้ำมากกว่า 2 ที่
- [ ] หน้าตา/behavior เหมือนกันทุกที่
- [ ] ไม่มี business logic เฉพาะ module
- [ ] มี props ที่ยืดหยุ่นพอ
- [ ] มี TypeScript types ครบ

## Tech Stack
- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7 + Module Federation
- **UI Library**: Ant Design 6
- **State Management**: Zustand 5
- **HTTP Client**: Axios (wrapped in shared httpClient)
- **Routing**: React Router DOM 7
- **Date Library**: Day.js

## Code Conventions

### File Structure (per module)
```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API service functions
├── stores/         # Zustand stores
├── types/          # TypeScript interfaces/types
├── utils/          # Utility functions
├── contexts/       # React contexts
└── styles/         # CSS files
```

### Naming Conventions
- **Components**: PascalCase (e.g., `POSearchFilter.tsx`, `CancelPOModal.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `usePOColumns.tsx`, `usePOListData.ts`)
- **Services**: camelCase with "Service" suffix (e.g., `poService.ts`, `approvedConfigService.ts`)
- **Types**: PascalCase (e.g., `POHeader`, `ApprovedAction`)
- **Stores**: camelCase with "Store" suffix (e.g., `authStore.ts`, `poStore.ts`)
- **Utils**: camelCase (e.g., `calculations.ts`, `formatters.ts`)

### Export Pattern
- ใช้ `index.ts` สำหรับ re-export ทุก folder
- Export แบบ named exports ไม่ใช้ default export

### Type Definitions
- สร้างไฟล์ type แยกต่างหากใน `types/` folder
- API Response types ควรมี suffix `Response` (e.g., `POHeaderListResponse`)
- Request types ควรมี suffix `Request` (e.g., `POInsertRequest`)

### Service Pattern
```typescript
// ตัวอย่าง service function
export async function getXXX(
  param1: string,
  accessToken: string,
  packageCode: string
): Promise<XXXResponse> {
  return httpClient.get<XXXResponse>(`/api/XXX/Endpoint`, {
    accessToken,
    packageCode,
    params: { param1 },
  })
}

// Export as object for easier mocking
export const xxxService = {
  getXXX,
}
```

### Hook Pattern
```typescript
// Custom hook สำหรับ data fetching และ business logic
export function useXXX() {
  const { accessToken, companyCode } = useAuthStore()
  const [data, setData] = useState<XXX | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // fetch logic
  }, [dependencies])

  return { data, isLoading, ...actions }
}
```

### Component Pattern
- ใช้ function components + hooks
- Props interface ควรตั้งชื่อเป็น `XXXProps`
- ใช้ `useCallback` สำหรับ event handlers ที่ส่งลง children
- ใช้ `useMemo` สำหรับ computed values ที่ expensive

## API Conventions
- Base URL มาจาก environment variable `VITE_API_BASE_URL`
- Token มาจาก `VITE_API_TOKEN_BEARER` หรือ authStore
- Package code มาจาก `VITE_API_DEFAULT_PACKAGE` หรือ authStore.companyCode
- API Response format: `{ code: number, msg: string | null, result: T | null }`
- หรือ: `{ status: boolean, message: string, data: T | null }`

## State Management (Zustand)
- แยก store ตาม domain (authStore, poStore)
- ใช้ selectors เพื่อ optimize re-renders
- Export individual selectors และ main store hook

## UI/UX Guidelines
- ใช้ Ant Design components เป็นหลัก
- Table columns ควรมี width กำหนด
- ใช้ Tag component สำหรับแสดง status
- Modal สำหรับ confirm actions
- Loading states ใช้ Spin หรือ Table loading

## Language
- UI Text: ภาษาไทย
- Code/Comments: ภาษาอังกฤษ
- Variable/Function names: ภาษาอังกฤษ

## Common Tasks

### เพิ่ม API ใหม่
1. สร้าง type ใน `types/xxx.ts`
2. Export จาก `types/index.ts`
3. สร้าง service ใน `services/xxxService.ts`
4. Export จาก `services/index.ts`
5. สร้าง hook ใน `hooks/useXXX.ts` (ถ้าจำเป็น)
6. Export จาก `hooks/index.ts`

### เพิ่ม Column ใน Table
1. เพิ่ม field ใน type definition
2. เพิ่ม column config ใน `PO_COLUMN_CONFIGS` (สำหรับ column selector)
3. เพิ่ม column definition ใน `usePOColumns` hook
4. อัพเดท dependencies ใน useMemo

### เพิ่ม Component
1. สร้างไฟล์ใน `components/XXX.tsx`
2. Export จาก `components/index.ts`

---

## 📚 Patterns & Best Practices Reference

### 🔄 Patterns ที่ใช้ในโปรเจค

| Pattern | ใช้ที่ไหน | หน้าที่ |
|---------|----------|--------|
| **Micro-Frontend** | Portal + Remotes | แยก app เป็น module อิสระ build/deploy แยกกันได้ |
| **Service Pattern** | `services/*.ts` | รวม API calls ไว้ที่เดียว |
| **Hook Pattern** | `hooks/*.ts` | แยก logic ออกจาก component |
| **Store Pattern** | `stores/*.ts` | จัดการ global state (Zustand) |
| **Container/Presenter** | Pages + Components | แยก logic (container) กับ UI (presenter) |
| **Barrel Export** | `index.ts` | รวม exports ไว้จุดเดียว import ง่าย |

### ✅ Best Practices

#### 1. Single Responsibility (ทำหน้าที่เดียว)
```typescript
// ❌ ไม่ดี - ทำหลายอย่างในที่เดียว
function POPage() {
  const [data, setData] = useState()
  // fetch logic, filter logic, sort logic ปนกันหมด
}

// ✅ ดี - แยกหน้าที่ชัดเจน
function POPage() {
  const { data, isLoading } = usePOList()  // hook จัดการ data
  return <POTable data={data} />            // component แสดงผล
}
```

#### 2. DRY (Don't Repeat Yourself)
```typescript
// ❌ ไม่ดี - copy โค้ดซ้ำ
const formattedDate1 = dayjs(date1).format('DD/MM/YYYY')
const formattedDate2 = dayjs(date2).format('DD/MM/YYYY')

// ✅ ดี - สร้าง utility function
const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY')
```

#### 3. Early Return (return เร็ว ลด nesting)
```typescript
// ❌ ไม่ดี - nested ลึก
function process(data) {
  if (data) {
    if (data.items) {
      if (data.items.length > 0) {
        // do something
      }
    }
  }
}

// ✅ ดี - early return
function process(data) {
  if (!data) return
  if (!data.items) return
  if (data.items.length === 0) return
  // do something
}
```

#### 4. Descriptive Naming (ตั้งชื่อให้อ่านรู้เรื่อง)
```typescript
// ❌ ไม่ดี
const d = getData()
const x = d.filter(i => i.s === 'A')

// ✅ ดี
const purchaseOrders = getPurchaseOrders()
const approvedOrders = purchaseOrders.filter(order => order.status === 'Approved')
```

#### 5. Error Handling (จัดการ error)
```typescript
// ❌ ไม่ดี - ไม่ handle error
const data = await fetchData()

// ✅ ดี - handle error
try {
  const data = await fetchData()
} catch (error) {
  message.error('เกิดข้อผิดพลาด')
  console.error(error)
}
```

#### 6. Loading States (แสดง loading)
```typescript
// ❌ ไม่ดี - ไม่แสดง loading
return <Table data={data} />

// ✅ ดี - แสดง loading
return <Table data={data} loading={isLoading} />
```

### 🚫 Anti-Patterns (สิ่งที่ไม่ควรทำ)

| Anti-Pattern | ปัญหา | แก้ไขยังไง |
|--------------|-------|-----------|
| **God Component** | Component ใหญ่มาก ทำทุกอย่าง | แยกเป็น component ย่อยๆ |
| **Prop Drilling** | ส่ง props ลงไปหลายชั้น | ใช้ Context หรือ Zustand |
| **Magic Numbers** | ใช้ตัวเลขโดยไม่มีความหมาย | สร้าง constants |
| **Copy-Paste Code** | copy โค้ดซ้ำๆ | สร้าง function/component reusable |
| **Ignoring Errors** | ไม่ handle error | ใช้ try-catch + แสดง message |

### 💡 เทคนิคที่ควรรู้

#### useCallback - ป้องกัน re-render
```typescript
// ใช้เมื่อส่ง function ลง child component
const handleClick = useCallback(() => {
  // do something
}, [dependencies])
```

#### useMemo - cache ค่าที่คำนวณหนัก
```typescript
// ใช้เมื่อ compute ข้อมูลที่ใช้เวลา
const totalAmount = useMemo(() => {
  return items.reduce((sum, item) => sum + item.amount, 0)
}, [items])
```

#### Lazy Loading - โหลด component เมื่อต้องการ
```typescript
// ใช้กับ remote components หรือ pages
const POApp = lazy(() => import('purchaseOrder/App'))
```

---

## 📝 Git Commit Convention

### รูปแบบ Commit Message
```
<type>(<scope>): <subject>

[optional body]
```

### Types ที่ใช้

| Type | ใช้เมื่อ | ตัวอย่าง |
|------|---------|---------|
| `feat` | เพิ่ม feature ใหม่ | `feat(dashboard): add banner carousel` |
| `fix` | แก้ bug | `fix(po): correct total calculation` |
| `refactor` | ปรับโครงสร้างโค้ด (ไม่เปลี่ยน behavior) | `refactor(po): extract table columns to hook` |
| `style` | แก้ไข formatting, whitespace | `style(portal): format code with prettier` |
| `docs` | เพิ่ม/แก้ไข documentation | `docs: update README` |
| `chore` | งาน maintenance (build, config) | `chore: update dependencies` |
| `perf` | ปรับปรุง performance | `perf(table): add virtualization` |

### Scope ที่ใช้บ่อย
- `portal` - Portal host app
- `po` หรือ `purchase-order` - Purchase Order module
- `dashboard` - Dashboard module
- `shared` - Shared utilities
- `build` - Build scripts

### ตัวอย่าง Commit Messages
```bash
# Feature ใหม่
feat(dashboard): add promotional banner carousel

# แก้ bug
fix(po): fix incorrect tax calculation in line items

# Refactor
refactor(po): split POForm into smaller components

# หลายอย่าง
feat(portal): add dashboard remote integration

- Add dashboard lazy import
- Add route for home page
- Update vite config with dashboard remote
```

---

## 🔷 TypeScript Tips

### 1. Interface vs Type
```typescript
// ✅ ใช้ interface สำหรับ object shape (extend ได้)
interface POHeader {
  poNo: string
  vendorCode: string
}

// ✅ ใช้ type สำหรับ union, intersection, utility types
type Status = 'draft' | 'approved' | 'rejected'
type POWithStatus = POHeader & { status: Status }
```

### 2. Generics - ทำให้ reusable
```typescript
// ❌ ไม่ดี - ต้องสร้างหลาย function
function getUser(): User { ... }
function getProduct(): Product { ... }

// ✅ ดี - ใช้ generic
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return response.json()
}

// เรียกใช้
const user = await fetchData<User>('/api/user')
const product = await fetchData<Product>('/api/product')
```

### 3. Type Guard - ตรวจสอบ type
```typescript
// ใช้เมื่อ TypeScript ไม่รู้ type แน่นอน
function isError(response: SuccessResponse | ErrorResponse): response is ErrorResponse {
  return 'error' in response
}

// เรียกใช้
if (isError(response)) {
  console.error(response.error)  // TypeScript รู้ว่าเป็น ErrorResponse
} else {
  console.log(response.data)     // TypeScript รู้ว่าเป็น SuccessResponse
}
```

### 4. Utility Types ที่ใช้บ่อย
```typescript
// Partial<T> - ทุก field เป็น optional
type UpdatePO = Partial<POHeader>  // { poNo?: string, vendorCode?: string }

// Pick<T, K> - เลือกบาง field
type POPreview = Pick<POHeader, 'poNo' | 'vendorCode'>

// Omit<T, K> - เอาออกบาง field
type POWithoutId = Omit<POHeader, 'id'>

// Record<K, V> - สร้าง object type
type StatusColors = Record<Status, string>
// { draft: string, approved: string, rejected: string }
```

### 5. Optional Chaining & Nullish Coalescing
```typescript
// ❌ ไม่ดี - อาจ crash ถ้า null
const name = user.profile.name

// ✅ ดี - ใช้ optional chaining (?.) และ nullish coalescing (??)
const name = user?.profile?.name ?? 'Unknown'
```

### 6. as const - ทำให้เป็น literal type
```typescript
// ❌ ไม่ดี - TypeScript คิดว่าเป็น string[]
const STATUSES = ['draft', 'approved', 'rejected']

// ✅ ดี - TypeScript รู้ว่าเป็น readonly tuple
const STATUSES = ['draft', 'approved', 'rejected'] as const
type Status = typeof STATUSES[number]  // 'draft' | 'approved' | 'rejected'
```

---

## 🏗️ Build System Pattern

### Overview
โปรเจคใช้ `build-prod.bat` ในการ build และ deploy Micro-Frontend ทั้งหมดไปยัง IIS Server

### ไฟล์ที่เกี่ยวข้อง
```
QReact/
├── build-prod.bat                    # 🔧 Main build script
├── deploy/
│   ├── output/                       # 📦 Built files (auto-generated)
│   ├── web.config                    # Portal IIS config
│   └── web.config.po                 # Sub-folder IIS config (for remotes)
├── portal/
│   └── vite.config.prod.ts           # Portal production config (host)
├── general/dashboard/
│   └── vite.config.prod.ts           # Dashboard production config (remote)
├── business-data-monitoring/
│   └── vite.config.prod.ts           # Business Data production config (remote)
└── Q-ERPc/purchase/purchase-order/
    └── vite.config.prod.ts           # PO production config (remote)
```

### Deploy Structure บน IIS
```
C:\inetpub\Web PO\                    # IIS_DIR
├── index.html                        # Portal
├── assets/                           # Portal assets
├── web.config                        # Portal routing config
├── po/                               # Purchase Order remote
│   ├── assets/remoteEntry.js
│   └── web.config
├── dashboard/                        # Dashboard remote
│   ├── assets/remoteEntry.js
│   └── web.config
└── business-data/                    # Business Data remote
    ├── assets/remoteEntry.js
    └── web.config
```

---

### 📝 Checklist: เพิ่ม Micro-Frontend ใหม่เข้า Build System

เมื่อต้องการเพิ่ม remote app ใหม่เข้าระบบ ให้ทำตาม checklist นี้:

#### Step 1: สร้าง `vite.config.prod.ts` ใน project ใหม่

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// ========================================
// Production Config สำหรับ IIS Sub-folder
// ========================================
// Server: http://192.168.0.131:1005/{sub-folder}/
// IIS Path: C:\inetpub\Web PO\{sub-folder}

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'ชื่อProjectCamelCase',      // เช่น businessDataMonitoring
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'antd']
    })
  ],
  base: '/sub-folder-path/',            // เช่น /business-data/ (ต้องมี / หน้าหลัง)
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: true,
    cssCodeSplit: false,
    outDir: 'dist',
  }
})
```

**สิ่งที่ต้องเปลี่ยน:**
- `name`: ชื่อ federation (camelCase) - ต้องตรงกับที่ portal import
- `base`: sub-folder path บน IIS (ต้องมี `/` ทั้งหน้าและหลัง)

---

#### Step 2: เพิ่ม remote ใน `portal/vite.config.prod.ts`

```typescript
// เพิ่มใน remotes object
remotes: {
  // ... existing remotes
  ชื่อProject: `${IIS_URL}/sub-folder/assets/remoteEntry.js?v=${VERSION}`,
},
```

**ตัวอย่าง:**
```typescript
remotes: {
  salesVisitor: `${IIS_URL}/sv/assets/remoteEntry.js?v=${VERSION}`,
  purchaseOrder: `${IIS_URL}/po/assets/remoteEntry.js?v=${VERSION}`,
  dashboard: `${IIS_URL}/dashboard/assets/remoteEntry.js?v=${VERSION}`,
  businessDataMonitoring: `${IIS_URL}/business-data/assets/remoteEntry.js?v=${VERSION}`,  // ← เพิ่มใหม่
},
```

---

#### Step 3: แก้ไข `build-prod.bat`

**3.1 เพิ่มตัวแปร directory (บรรทัดบนๆ)**
```batch
set NEW_PROJECT_DIR=path\to\project
```

**3.2 เพิ่ม menu option ใหม่**
```batch
echo   X. Build New Project only
```

**3.3 เพิ่ม goto label**
```batch
if "%choice%"=="X" goto :build_new_project
```

**3.4 เพิ่ม build step ใน `:build_all` และ `:build_and_copy`**
```batch
echo.
echo [X/Y] Building New Project...
cd %NEW_PROJECT_DIR%
call npx vite build --config vite.config.prod.ts
if errorlevel 1 (
    echo ERROR: Build New Project failed!
    cd ..
    pause
    goto :end
)
cd ..
```

**3.5 เพิ่ม mkdir ใน deploy folder**
```batch
mkdir "%DEPLOY_DIR%\sub-folder"
```

**3.6 เพิ่ม xcopy และ web.config**
```batch
xcopy /s /e /y /q %NEW_PROJECT_DIR%\dist\* "%DEPLOY_DIR%\sub-folder\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\sub-folder\web.config" >nul
```

**3.7 สร้าง label สำหรับ build เดี่ยว**
```batch
:build_new_project
echo.
echo Building New Project...
cd %NEW_PROJECT_DIR%
call npx vite build --config vite.config.prod.ts
cd ..

echo.
echo Copying New Project files...
if not exist "%DEPLOY_DIR%\sub-folder" mkdir "%DEPLOY_DIR%\sub-folder"
xcopy /s /e /y /q %NEW_PROJECT_DIR%\dist\* "%DEPLOY_DIR%\sub-folder\"
copy /y deploy\web.config.po "%DEPLOY_DIR%\sub-folder\web.config" >nul

echo.
echo Build New Project Complete!
goto :end
```

---

#### Step 4: Import ใน Portal (`portal/src/pages/Main.tsx`)

**4.1 เพิ่ม lazy import**
```typescript
const NewProjectApp = lazy(() => import('ชื่อProject/App'))
```

**4.2 สร้าง wrapper component (ถ้าต้องส่ง props)**
```typescript
interface NewProjectPageWrapperProps {
  username: string
  accessToken: string
  companyCode: string
}

const NewProjectPageWrapper = ({ username, accessToken, companyCode }: NewProjectPageWrapperProps) => (
  <NewProjectApp
    username={username}
    accessToken={accessToken}
    companyCode={companyCode}
  />
)
```

**4.3 เพิ่ม Route**
```typescript
<Route
  path="new-project/*"
  element={
    <RouteGuard menuKey="new-project">
      <ErrorBoundary>
        <NewProjectPageWrapper
          username={username || ''}
          accessToken={accessToken || ''}
          companyCode={menuPermission?.companyCode || ''}
        />
      </ErrorBoundary>
    </RouteGuard>
  }
/>
```

---

#### Step 5: เพิ่ม TypeScript declaration (ถ้ายังไม่มี)

สร้างหรือแก้ไข `portal/src/vite-env.d.ts`:
```typescript
declare module 'ชื่อProject/App' {
  const App: React.ComponentType<{
    username: string
    accessToken: string
    companyCode: string
  }>
  export default App
}
```

---

### 🔄 Cache Busting

Portal ใช้ timestamp เป็น version โดยอัตโนมัติ:
```typescript
// portal/vite.config.prod.ts
const VERSION = Date.now().toString()
```

ทุกครั้งที่ build portal ใหม่ browser จะโหลด remoteEntry.js ใหม่ทันที ไม่ต้อง clear cache

---

### ✅ Quick Reference Table

| Item | ตัวอย่าง |
|------|---------|
| Federation name | `businessDataMonitoring` (camelCase) |
| Base path | `/business-data/` (มี / ทั้งหน้าหลัง) |
| Remote URL | `${IIS_URL}/business-data/assets/remoteEntry.js?v=${VERSION}` |
| Deploy folder | `deploy\output\business-data\` |
| IIS folder | `C:\inetpub\Web PO\business-data\` |
| Lazy import | `const App = lazy(() => import('businessDataMonitoring/App'))` |

---

### ⚠️ Common Issues

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| `Failed to resolve import` | ไม่ได้เพิ่ม remote ใน portal config | เพิ่มใน `portal/vite.config.prod.ts` remotes |
| 404 remoteEntry.js | base path ไม่ตรง | ตรวจสอบ `base` ใน vite config ต้องตรงกับ sub-folder |
| Cache ไม่ refresh | VERSION เดิม | ใช้ `Date.now()` แทน static version |
| Module not found | TypeScript ไม่รู้จัก | เพิ่ม declare module ใน `vite-env.d.ts` |

---
