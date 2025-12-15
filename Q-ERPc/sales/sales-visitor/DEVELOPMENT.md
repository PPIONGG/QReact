# Sales Visitor - Remote Module Development Guide

---

## 🚀 Quick Start - พัฒนาแบบ Standalone

ถ้าคุณดูแลแค่ Remote module อย่างเดียว ให้ใช้วิธีนี้:

```bash
npm install
npm run dev:standalone
```

เปิดเบราว์เซอร์: **http://localhost:5001**

✅ **มี Hot Reload!** แก้โค้ด → บันทึก → เห็นผลทันที

---

## 📦 Scripts

### `npm run dev:standalone` (แนะนำ!)
- รัน remote แบบ standalone app
- มี **hot reload** เหมือน React app ปกติ
- ไม่ต้องรัน Host
- ไม่ต้อง refresh browser เอง

### `npm run dev:integrated`
- รัน remote แบบ Module Federation
- ใช้เมื่อต้องการทดสอบกับ Host
- ต้อง refresh browser เมื่อแก้โค้ด

---

## 🎯 Workflow

### วันปกติ (พัฒนา feature):

```bash
npm run dev:standalone
```

1. เปิด http://localhost:5001
2. แก้โค้ดใน `src/App.tsx`
3. บันทึก → เห็นผลทันที ✅
4. Commit & Push

---

### เมื่อต้องการทดสอบกับ Host:

**Terminal 1:**
```bash
npm run dev:integrated
```

**Terminal 2:**
```bash
cd ../host
npm run dev
```

เปิด http://localhost:5000 → Refresh เมื่อแก้โค้ด

---

## 💡 สรุป

**ทำงานคนเดียว?** → ใช้ `npm run dev:standalone` (มี hot reload!)

**ทดสอบกับ Host?** → ใช้ `npm run dev:integrated` (ต้อง refresh)

---

Happy Coding! 🚀
