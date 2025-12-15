# การส่งข้อมูลระหว่าง Portal และ Remote

คู่มือสำหรับการแชร์ข้อมูลระหว่าง Portal Application และ Remote Modules

---

## ✅ วิธีที่ 1: ผ่าน Props (แนะนำ - ใช้แล้ว!)

เหมาะสำหรับ: ข้อมูลพื้นฐาน, User info, Configuration

### Remote App (รับ props):

```typescript
// sales-visitor/src/App.tsx
interface AppProps {
  username?: string
  userId?: string
  role?: string
}

function App({ username, userId, role }: AppProps = {}) {
  return (
    <div>
      <h2>ยินดีต้อนรับ {username}</h2>
      <p>Role: {role}</p>
    </div>
  )
}
```

### Portal (ส่ง props):

```typescript
// portal/src/pages/Main.tsx
<SalesVisitorApp
  username={username}
  userId="USER-12345"
  role="Sales Manager"
/>
```

### Type Definition:

```typescript
// portal/src/vite-env.d.ts
interface SalesVisitorAppProps {
  username?: string
  userId?: string
  role?: string
}

declare module 'salesVisitor/App' {
  const App: React.ComponentType<SalesVisitorAppProps>
  export default App
}
```

**ข้อดี:**
- ✅ ง่าย เหมือน React component ทั่วไป
- ✅ Type-safe
- ✅ ชัดเจน

**ข้อเสีย:**
- ❌ Remote ต้อง rebuild เมื่อเปลี่ยน interface

---

## 🔄 วิธีที่ 2: Context API

เหมาะสำหรับ: Shared state ที่ซับซ้อน, Global state

### สร้าง Shared Context:

```typescript
// shared/UserContext.tsx (ใน Portal)
import { createContext } from 'react'

export interface UserContextType {
  username: string
  userId: string
  role: string
  permissions: string[]
}

export const UserContext = createContext<UserContextType | null>(null)
```

### Portal ให้ Context:

```typescript
// portal/src/pages/Main.tsx
import { UserContext } from './shared/UserContext'

function Main() {
  const userData = {
    username: 'สมชาย',
    userId: 'USER-123',
    role: 'Admin',
    permissions: ['read', 'write']
  }

  return (
    <UserContext.Provider value={userData}>
      <SalesVisitorApp />
    </UserContext.Provider>
  )
}
```

### Remote ใช้ Context:

```typescript
// sales-visitor/src/App.tsx
import { useContext } from 'react'
import { UserContext } from '../../shared/UserContext' // Shared folder

function App() {
  const user = useContext(UserContext)

  return <div>Welcome {user?.username}</div>
}
```

**ข้อดี:**
- ✅ ไม่ต้องส่ง props ลงไปหลายชั้น
- ✅ เหมาะกับ nested components

**ข้อเสีย:**
- ❌ ต้องมี shared folder
- ❌ ซับซ้อนกว่า props

---

## 📡 วิธีที่ 3: Custom Events

เหมาะสำหรับ: Communication 2 ทาง, Real-time updates

### Portal ส่ง Event:

```typescript
// portal/src/pages/Main.tsx
useEffect(() => {
  const event = new CustomEvent('userDataUpdate', {
    detail: {
      username: 'สมชาย',
      userId: 'USER-123'
    }
  })
  window.dispatchEvent(event)
}, [])
```

### Remote รับ Event:

```typescript
// sales-visitor/src/App.tsx
useEffect(() => {
  const handleUserData = (event: any) => {
    const userData = event.detail
    console.log('Received:', userData)
  }

  window.addEventListener('userDataUpdate', handleUserData)

  return () => {
    window.removeEventListener('userDataUpdate', handleUserData)
  }
}, [])
```

**ข้อดี:**
- ✅ Loosely coupled
- ✅ Communication 2 ทาง

**ข้อเสีย:**
- ❌ ไม่ Type-safe
- ❌ ยากต่อการ debug

---

## 💾 วิธีที่ 4: LocalStorage / SessionStorage

เหมาะสำหรับ: Data persistence, Simple sharing

### Portal บันทึก:

```typescript
// portal/src/pages/Main.tsx
localStorage.setItem('userData', JSON.stringify({
  username: 'สมชาย',
  userId: 'USER-123',
  token: 'abc123'
}))
```

### Remote อ่าน:

```typescript
// sales-visitor/src/App.tsx
const userData = JSON.parse(
  localStorage.getItem('userData') || '{}'
)
```

**ข้อดี:**
- ✅ ง่ายมาก
- ✅ Data persist across reload

**ข้อเสีย:**
- ❌ ไม่ reactive (ต้อง poll หรือใช้ storage event)
- ❌ Security concerns (ห้ามเก็บ sensitive data)

---

## 🌐 วิธีที่ 5: Shared State Library

เหมาะสำหรับ: Complex state management

### ใช้ Zustand, Redux, หรือ Jotai:

```typescript
// shared/store.ts
import create from 'zustand'

export const useUserStore = create((set) => ({
  username: '',
  setUsername: (name) => set({ username: name })
}))
```

### Portal:

```typescript
import { useUserStore } from './shared/store'

function Main() {
  const setUsername = useUserStore(state => state.setUsername)

  useEffect(() => {
    setUsername('สมชาย')
  }, [])
}
```

### Remote:

```typescript
import { useUserStore } from '../../shared/store'

function App() {
  const username = useUserStore(state => state.username)
  return <div>{username}</div>
}
```

**ข้อดี:**
- ✅ Powerful state management
- ✅ Reactive updates

**ข้อเสีย:**
- ❌ ต้อง share library (ระวัง version conflicts)
- ❌ เพิ่ม complexity

---

## 📋 สรุปการเลือกใช้

| วิธี | ความง่าย | Type Safety | Use Case |
|------|----------|-------------|----------|
| **Props** ⭐ | ⭐⭐⭐ | ⭐⭐⭐ | User info, Config |
| Context API | ⭐⭐ | ⭐⭐⭐ | Global state |
| Custom Events | ⭐⭐ | ⭐ | 2-way communication |
| LocalStorage | ⭐⭐⭐ | ⭐ | Simple persistence |
| State Library | ⭐ | ⭐⭐⭐ | Complex apps |

---

## 🔒 Security Best Practices

### ✅ DO:
- ส่งเฉพาะข้อมูลที่จำเป็น
- Validate data ทั้ง Portal และ Remote
- ใช้ TypeScript สำหรับ type safety
- Sanitize user input

### ❌ DON'T:
- ห้ามส่ง password ผ่าน props
- ห้ามเก็บ token ใน localStorage (ใช้ httpOnly cookies)
- ห้ามส่ง sensitive data ผ่าน custom events
- ห้าม trust ข้อมูลจาก Remote โดยไม่ validate

---

## 💡 Tips

1. **เริ่มจาก Props**: ใช้ props ก่อนเสมอ เพิ่ม complexity ทีหลัง
2. **Document Interface**: เขียน interface ให้ชัดเจน
3. **Version Control**: เวลาเปลี่ยน interface ต้อง coordinate ระหว่างทีม
4. **Error Handling**: ระวัง undefined/null values

---

## 🎯 ตัวอย่างการใช้งานจริง

### Scenario: E-commerce Checkout

**Portal ส่ง:**
- User info (name, email)
- Cart items
- Payment token

**Remote (Checkout Module) รับ:**
```typescript
interface CheckoutProps {
  user: {
    name: string
    email: string
  }
  cartItems: CartItem[]
  onComplete: (orderId: string) => void
}
```

**Remote ส่งกลับ:**
- ใช้ callback `onComplete` เมื่อ checkout สำเร็จ

---

สำหรับโปรเจคนี้ เราใช้ **Props** เพราะ:
- ✅ ง่าย ชัดเจน
- ✅ Type-safe
- ✅ เหมาะกับการส่ง user info

ลอง build Remote ใหม่แล้วรันดูครับ! 🚀
