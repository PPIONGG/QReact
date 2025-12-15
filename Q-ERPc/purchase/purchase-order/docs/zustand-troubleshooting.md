# Zustand Troubleshooting Guide

เอกสารนี้รวบรวมปัญหาที่พบและวิธีแก้ไขเมื่อใช้ Zustand กับ React

---

## ปัญหาที่ 1: Maximum update depth exceeded (Infinite Loop)

### อาการ
```
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

### สาเหตุ
`permission` object (หรือ object/array อื่นๆ) ถูกสร้างใหม่ทุก render ทำให้ useEffect dependency เปลี่ยนตลอด → เรียก `setState` ซ้ำไม่หยุด

### ตัวอย่างโค้ดที่มีปัญหา
```typescript
// ❌ ปัญหา - permission object ใหม่ทุก render
useEffect(() => {
  setAuth({ username, accessToken, companyCode, permission })
}, [username, accessToken, companyCode, permission, setAuth])
```

### วิธีแก้ไข
ใช้ `useRef` เก็บค่าก่อนหน้า แล้วเปรียบเทียบก่อน setState

```typescript
// ✅ แก้ไข - เปรียบเทียบค่าก่อน setState
const prevAuthRef = useRef<string | null>(null)

useEffect(() => {
  const authKey = `${username}|${accessToken}|${companyCode}|${JSON.stringify(permission)}`
  if (prevAuthRef.current !== authKey) {
    prevAuthRef.current = authKey
    setAuth({
      username,
      accessToken,
      companyCode,
      permission,
    })
  }
}, [username, accessToken, companyCode, permission, setAuth])
```

---

## ปัญหาที่ 2: The result of getSnapshot should be cached

### อาการ
```
The result of getSnapshot should be cached to avoid an infinite loop
```

### สาเหตุ
Zustand selector สร้าง array/object ใหม่ทุก render ทำให้ React คิดว่า state เปลี่ยน

### ตัวอย่างโค้ดที่มีปัญหา
```typescript
// ❌ ปัญหา - .map() สร้าง array ใหม่ทุกครั้ง
export const useDocumentTypeOptions = () =>
  usePOStore((state) =>
    state.documentTypes.map((dt) => ({
      value: dt.documentTypeCode,
      label: dt.documentTypeCodeDescriptionT,
    }))
  )
```

### วิธีแก้ไข
Return raw data จาก selector แล้วใช้ `useMemo` ใน component

```typescript
// ✅ แก้ไข - Store: return raw array
export const useDocumentTypes = () =>
  usePOStore((state) => state.documentTypes)

// ✅ แก้ไข - Component: ใช้ useMemo transform
const documentTypes = useDocumentTypes()

const documentTypeOptions = useMemo(
  () =>
    documentTypes.map((dt) => ({
      value: dt.documentTypeCode,
      label: dt.documentTypeCodeDescriptionT,
    })),
  [documentTypes]
)
```

---

## ปัญหาที่ 3: API เรียกซ้ำ 2 ครั้ง

### อาการ
API ถูกเรียก 2 ครั้งติดกันเมื่อ component mount

### สาเหตุ
React Strict Mode (development) จะ mount → unmount → mount component เพื่อตรวจจับ side effects ที่ไม่ถูกต้อง

### ตัวอย่างโค้ดที่มีปัญหา
```typescript
// ❌ ปัญหา - ถูกเรียก 2 ครั้งใน Strict Mode
useEffect(() => {
  fetchDocTypes()
}, [username, accessToken, companyCode])
```

### วิธีแก้ไข
ใช้ `useRef` เก็บ flag ว่า fetch แล้วหรือยัง

```typescript
// ✅ แก้ไข - ใช้ useRef flag
const hasFetchedDocTypes = useRef(false)

useEffect(() => {
  if (!username || !accessToken || !companyCode) return
  if (hasFetchedDocTypes.current) return  // skip ถ้า fetch แล้ว

  hasFetchedDocTypes.current = true

  const fetchDocTypes = async () => {
    setIsLoadingDocTypes(true)
    try {
      const response = await getDocumentTypeRightList('PO', username, accessToken, companyCode)
      if (response.code === 0 && response.result) {
        setDocumentTypes(response.result)
      }
    } catch (error) {
      console.error('Failed to fetch document types:', error)
    } finally {
      setIsLoadingDocTypes(false)
    }
  }

  fetchDocTypes()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [username, accessToken, companyCode])
```

---

## สรุปหลักการสำคัญ

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| Infinite loop | Object/Array reference เปลี่ยนทุก render | ใช้ `useRef` เปรียบเทียบค่าก่อน setState |
| getSnapshot error | Selector สร้างค่าใหม่ทุกครั้ง | Return primitive/stable reference, ใช้ `useMemo` ใน component |
| API เรียกซ้ำ | Strict Mode mount 2 ครั้ง | ใช้ `useRef` flag ป้องกันการเรียกซ้ำ |

---

## Best Practices สำหรับ Zustand

### 1. Selector ควร return stable reference
```typescript
// ✅ Good - return primitive หรือ stable array
export const useSearchText = () => usePOStore((state) => state.searchText)
export const useDocumentTypes = () => usePOStore((state) => state.documentTypes)

// ❌ Bad - สร้าง object/array ใหม่
export const useOptions = () => usePOStore((state) => state.items.map(...))
```

### 2. ใช้ useMemo สำหรับ derived data
```typescript
const rawData = useRawData()
const transformedData = useMemo(() => transform(rawData), [rawData])
```

### 3. ใช้ useRef สำหรับ side effects ที่ต้องการทำครั้งเดียว
```typescript
const hasFetched = useRef(false)
useEffect(() => {
  if (hasFetched.current) return
  hasFetched.current = true
  fetchData()
}, [])
```

### 4. เปรียบเทียบค่าก่อน sync props เข้า store
```typescript
const prevRef = useRef<string | null>(null)
useEffect(() => {
  const key = JSON.stringify(props)
  if (prevRef.current !== key) {
    prevRef.current = key
    syncToStore(props)
  }
}, [props])
```

---

## ไฟล์ที่เกี่ยวข้อง

- `src/stores/authStore.ts` - Auth state management
- `src/stores/poStore.ts` - PO module state management
- `src/App.tsx` - Sync props to store
- `src/pages/POList.tsx` - Fetch document types with useRef flag

---

*สร้างเมื่อ: 2025-12-12*
*อัพเดทล่าสุด: 2025-12-12*
