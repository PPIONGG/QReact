# PO Module - User Flow (จัดเต็ม)

> รวม Flow การใช้งานระบบ Purchase Order ทั้งหมด
> อัพเดท: 29 ธันวาคม 2025

---

## 📋 สรุปหน้าและ Actions

| หน้า | Actions ที่ทำได้ |
|------|-----------------|
| **POList** | ดู, ค้นหา, กรอง, สร้าง, แก้ไข, ดูรายละเอียด, ยกเลิก, อนุมัติ, ปฏิเสธ, พิมพ์ |
| **POForm** | กรอกข้อมูล, เลือก Supplier, เพิ่ม/ลบ รายการสินค้า, บันทึก |
| **POPrintPreview** | ดูตัวอย่าง, พิมพ์เอกสาร |

---

## 1. หน้า POList - รายการใบสั่งซื้อ

### 1.1 เข้าหน้า POList

```mermaid
flowchart TD
    Start([เข้าระบบ]) --> Menu[เลือกเมนู Purchase Order]
    Menu --> LoadList[โหลดรายการ PO]
    LoadList --> ShowList[แสดงตาราง PO]
```

---

### 1.2 ค้นหาและกรอง

```mermaid
flowchart TD
    ShowList[หน้า POList] --> SearchAction{ต้องการค้นหา?}

    SearchAction -->|ค้นหา| InputSearch[พิมพ์ PO No / Supplier / Reference]
    InputSearch --> ClickSearch[กดค้นหา]
    ClickSearch --> FilterResult[แสดงผลลัพธ์]

    SearchAction -->|กรอง| SelectDocType[เลือกประเภทเอกสาร]
    SelectDocType --> FilterResult

    SearchAction -->|เลือก Column| OpenColumnSelector[เปิด Column Selector]
    OpenColumnSelector --> SelectColumns[เลือก Column ที่อยากเห็น]
    SelectColumns --> ApplyColumns[กดตกลง]
    ApplyColumns --> ShowList

    FilterResult --> ShowList
```

---

### 1.3 สร้าง PO ใหม่

```mermaid
flowchart TD
    ShowList[หน้า POList] --> ClickCreate[กดปุ่ม สร้างใบสั่งซื้อ]
    ClickCreate --> GoToForm[ไปหน้า POForm - โหมดสร้าง]
    GoToForm --> FormFlow[ดู Flow สร้าง PO ด้านล่าง]
```

---

### 1.4 ดูรายละเอียด PO

```mermaid
flowchart TD
    ShowList[หน้า POList] --> SelectRow[เลือกแถว PO]
    SelectRow --> ClickView[กดปุ่ม ดู]
    ClickView --> GoToFormView[ไปหน้า POForm - โหมดดู]
    GoToFormView --> ViewOnly[แสดงข้อมูล อ่านอย่างเดียว]
    ViewOnly --> ClickBack[กดปุ่ม กลับ]
    ClickBack --> ShowList
```

---

### 1.5 แก้ไข PO

```mermaid
flowchart TD
    ShowList[หน้า POList] --> SelectRow[เลือกแถว PO]
    SelectRow --> CheckStatus{สถานะ?}

    CheckStatus -->|Draft| ClickEdit[กดปุ่ม แก้ไข]
    ClickEdit --> GoToFormEdit[ไปหน้า POForm - โหมดแก้ไข]
    GoToFormEdit --> FormFlow[ดู Flow แก้ไข PO ด้านล่าง]

    CheckStatus -->|Approved/Cancelled| NoEdit[ไม่สามารถแก้ไขได้]
```

---

### 1.6 ยกเลิก PO

```mermaid
flowchart TD
    ShowList[หน้า POList] --> SelectRow[เลือกแถว PO]
    SelectRow --> CheckStatus{สถานะ?}

    CheckStatus -->|Draft/WaitApprove| ClickCancel[กดปุ่ม ยกเลิก]
    ClickCancel --> ShowCancelModal[แสดง Modal ยืนยัน]
    ShowCancelModal --> ConfirmCancel{ยืนยัน?}

    ConfirmCancel -->|ใช่| CallCancelAPI[เรียก API ยกเลิก]
    CallCancelAPI --> CancelResult{ผลลัพธ์?}
    CancelResult -->|สำเร็จ| ShowSuccess[แสดง ยกเลิกสำเร็จ]
    CancelResult -->|ไม่สำเร็จ| ShowError[แสดง Error]

    ConfirmCancel -->|ไม่| CloseModal[ปิด Modal]

    ShowSuccess --> RefreshList[โหลดรายการใหม่]
    ShowError --> CloseModal
    CloseModal --> ShowList
    RefreshList --> ShowList

    CheckStatus -->|Approved/Cancelled| NoCancel[ไม่สามารถยกเลิกได้]
```

---

### 1.7 อนุมัติ PO

```mermaid
flowchart TD
    ShowList[หน้า POList] --> SelectRow[เลือกแถว PO ที่รออนุมัติ]
    SelectRow --> CheckPermission{มีสิทธิ์อนุมัติ?}

    CheckPermission -->|ไม่มี| NoAction[ไม่แสดงปุ่มอนุมัติ]

    CheckPermission -->|มี| ClickApprovalDropdown[กดที่ Approval Status]
    ClickApprovalDropdown --> SelectAction{เลือก Action?}

    SelectAction -->|อนุมัติ| ShowApproveConfirm[แสดง Modal ยืนยัน]
    ShowApproveConfirm --> ConfirmApprove{ยืนยัน?}
    ConfirmApprove -->|ใช่| CallApproveAPI[เรียก API อนุมัติ]
    CallApproveAPI --> ApproveResult{ผลลัพธ์?}
    ApproveResult -->|สำเร็จ| ShowApproveSuccess[แสดง อนุมัติสำเร็จ]
    ApproveResult -->|ไม่สำเร็จ| ShowApproveError[แสดง Error]

    SelectAction -->|ปฏิเสธ| ShowRejectModal[แสดง Modal ใส่เหตุผล]
    ShowRejectModal --> InputReason[กรอกเหตุผลปฏิเสธ]
    InputReason --> ConfirmReject[กดยืนยัน]
    ConfirmReject --> CallRejectAPI[เรียก API ปฏิเสธ]
    CallRejectAPI --> RejectResult{ผลลัพธ์?}
    RejectResult -->|สำเร็จ| ShowRejectSuccess[แสดง ปฏิเสธสำเร็จ]
    RejectResult -->|ไม่สำเร็จ| ShowRejectError[แสดง Error]

    ShowApproveSuccess --> RefreshList[โหลดรายการใหม่]
    ShowRejectSuccess --> RefreshList
    RefreshList --> ShowList
```

---

### 1.8 พิมพ์ PO

```mermaid
flowchart TD
    ShowList[หน้า POList] --> SelectRow[เลือกแถว PO]
    SelectRow --> ClickPrint[กดปุ่ม พิมพ์]
    ClickPrint --> GoToPrintPreview[ไปหน้า POPrintPreview]
    GoToPrintPreview --> ShowPreview[แสดงตัวอย่างเอกสาร]
    ShowPreview --> ClickPrintBtn[กดปุ่ม พิมพ์เอกสาร]
    ClickPrintBtn --> OpenPrintDialog[เปิด Print Dialog]
    OpenPrintDialog --> SelectPrinter[เลือกเครื่องพิมพ์]
    SelectPrinter --> ConfirmPrint[กด Print]
    ConfirmPrint --> PrintDone[พิมพ์เสร็จ]
    PrintDone --> ClickBack[กดปุ่ม กลับ]
    ClickBack --> ShowList
```

---

## 2. หน้า POForm - สร้าง PO ใหม่

### 2.1 Flow สร้าง PO แบบเต็ม

```mermaid
flowchart TD
    Start([เข้าหน้า POForm]) --> LoadMaster[โหลด Master Data]
    LoadMaster --> ShowForm[แสดง Form ว่าง]

    %% Step 1: เลือก Document Type
    ShowForm --> SelectDocType[เลือกประเภทเอกสาร]
    SelectDocType --> GeneratePONo[ระบบสร้างเลข PO อัตโนมัติ]

    %% Step 2: เลือก Supplier
    GeneratePONo --> ClickSearchSupplier[กดค้นหาผู้ขาย]
    ClickSearchSupplier --> OpenSupplierModal[เปิด Modal ค้นหา Supplier]
    OpenSupplierModal --> SearchSupplier[พิมพ์ค้นหา Supplier]
    SearchSupplier --> SelectSupplier[เลือก Supplier]
    SelectSupplier --> FillSupplierInfo[ระบบดึงข้อมูล Supplier อัตโนมัติ]

    %% Step 3: กรอกข้อมูล Header
    FillSupplierInfo --> InputHeader[กรอกข้อมูลเพิ่มเติม]

    subgraph HeaderInfo["ข้อมูล Header"]
        InputHeader --> SelectWarehouse[เลือกคลังสินค้า]
        SelectWarehouse --> SelectCurrency[เลือกสกุลเงิน]
        SelectCurrency --> InputShipDate[กรอกวันที่ส่งของ]
        InputShipDate --> AutoPaymentDue[ระบบคำนวณ Payment Due อัตโนมัติ]
    end

    %% Step 4: เพิ่มรายการสินค้า
    AutoPaymentDue --> AddLineItem[กดเพิ่มรายการสินค้า]

    subgraph LineItems["รายการสินค้า"]
        AddLineItem --> ClickSearchItem[กดค้นหาสินค้า]
        ClickSearchItem --> OpenItemModal[เปิด Modal ค้นหา Item]
        OpenItemModal --> SearchItem[พิมพ์ค้นหา Item]
        SearchItem --> SelectItem[เลือก Item]
        SelectItem --> FillItemInfo[ระบบดึงข้อมูล Item อัตโนมัติ]
        FillItemInfo --> InputQty[กรอกจำนวน]
        InputQty --> InputPrice[กรอกราคาต่อหน่วย]
        InputPrice --> InputDiscount[กรอกส่วนลด - ถ้ามี]
        InputDiscount --> AutoCalcLine[ระบบคำนวณยอดรายการ]
    end

    AutoCalcLine --> MoreItems{เพิ่มสินค้าอีก?}
    MoreItems -->|ใช่| AddLineItem
    MoreItems -->|ไม่| CheckLineItems{มีสินค้าอย่างน้อย 1 รายการ?}

    %% Validation
    CheckLineItems -->|ไม่มี| ShowLineError[แสดง Error: ต้องมีสินค้าอย่างน้อย 1 รายการ]
    ShowLineError --> AddLineItem

    CheckLineItems -->|มี| AutoCalcSummary[ระบบคำนวณ Summary]

    subgraph Summary["สรุปยอด"]
        AutoCalcSummary --> CalcSubtotal[รวมเงินสินค้า]
        CalcSubtotal --> CalcDiscount[หักส่วนลดรวม]
        CalcDiscount --> CalcBeforeVAT[มูลค่าก่อน VAT]
        CalcBeforeVAT --> CalcVAT[คำนวณ VAT]
        CalcVAT --> CalcTotal[ยอดรวมทั้งสิ้น]
    end

    %% Step 5: กรอกข้อมูลเพิ่มเติม
    CalcTotal --> InputNote[กรอกหมายเหตุ - ถ้ามี]
    InputNote --> InputReference[กรอกเอกสารอ้างอิง - ถ้ามี]

    %% Step 6: บันทึก
    InputReference --> ClickSave[กดปุ่ม บันทึก]
    ClickSave --> ValidateForm{ข้อมูลครบถ้วน?}

    ValidateForm -->|ไม่ครบ| ShowValidationError[แสดง Error ที่ต้องแก้]
    ShowValidationError --> HighlightFields[Highlight ช่องที่ผิด]
    HighlightFields --> ShowForm

    ValidateForm -->|ครบ| ShowSaveConfirm[แสดง Modal ยืนยันบันทึก]
    ShowSaveConfirm --> ConfirmSave{ยืนยัน?}

    ConfirmSave -->|ไม่| CloseSaveModal[ปิด Modal]
    CloseSaveModal --> ShowForm

    ConfirmSave -->|ใช่| ShowSaving[แสดง Saving...]
    ShowSaving --> CallInsertAPI[เรียก API บันทึก]
    CallInsertAPI --> SaveResult{ผลลัพธ์?}

    SaveResult -->|สำเร็จ| ShowSaveSuccess[แสดง บันทึกสำเร็จ]
    ShowSaveSuccess --> GoToList[กลับหน้า POList]

    SaveResult -->|ไม่สำเร็จ| ShowSaveError[แสดง Error จาก API]
    ShowSaveError --> CloseSaveModal
```

---

### 2.2 Validation Rules สำหรับสร้าง PO

| ฟิลด์ | เงื่อนไข | Error Message |
|-------|---------|---------------|
| ประเภทเอกสาร | ต้องเลือก | กรุณาเลือกประเภทเอกสาร |
| ผู้ขาย | ต้องเลือก | กรุณาเลือกผู้ขาย |
| คลังสินค้า | ต้องเลือก | กรุณาเลือกคลังสินค้า |
| สกุลเงิน | ต้องเลือก | กรุณาเลือกสกุลเงิน |
| รายการสินค้า | ต้องมีอย่างน้อย 1 รายการ | กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ |
| จำนวน | ต้อง > 0 | จำนวนต้องมากกว่า 0 |
| ราคาต่อหน่วย | ต้อง >= 0 | ราคาต้องไม่ติดลบ |

---

## 3. หน้า POForm - แก้ไข PO

### 3.1 Flow แก้ไข PO

```mermaid
flowchart TD
    Start([เข้าหน้า POForm - แก้ไข]) --> LoadPOData[โหลดข้อมูล PO เดิม]
    LoadPOData --> ShowFilledForm[แสดง Form พร้อมข้อมูลเดิม]

    ShowFilledForm --> EditAction{ต้องการแก้ไขอะไร?}

    EditAction -->|แก้ไข Header| EditHeader[แก้ไขข้อมูล Header]
    EditHeader --> ShowFilledForm

    EditAction -->|แก้ไข Line Item| SelectLine[เลือกรายการที่จะแก้]
    SelectLine --> EditLine[แก้ไข จำนวน/ราคา/ส่วนลด]
    EditLine --> AutoRecalc[ระบบคำนวณใหม่อัตโนมัติ]
    AutoRecalc --> ShowFilledForm

    EditAction -->|ลบ Line Item| SelectLineDelete[เลือกรายการที่จะลบ]
    SelectLineDelete --> ClickDelete[กดปุ่มลบ]
    ClickDelete --> ConfirmDelete{ยืนยันลบ?}
    ConfirmDelete -->|ใช่| DeleteLine[ลบรายการ]
    DeleteLine --> CheckRemaining{เหลือสินค้า?}
    CheckRemaining -->|มี| AutoRecalc
    CheckRemaining -->|ไม่มี| ShowWarning[แจ้งเตือน: ต้องมีอย่างน้อย 1 รายการ]
    ShowWarning --> UndoDelete[Undo การลบ]
    UndoDelete --> ShowFilledForm
    ConfirmDelete -->|ไม่| ShowFilledForm

    EditAction -->|เพิ่ม Line Item| AddNewLine[เพิ่มรายการใหม่]
    AddNewLine --> SearchNewItem[ค้นหาและเลือกสินค้า]
    SearchNewItem --> AutoRecalc

    EditAction -->|บันทึก| ClickSaveEdit[กดปุ่ม บันทึก]
    ClickSaveEdit --> ValidateEdit{ข้อมูลครบถ้วน?}
    ValidateEdit -->|ไม่ครบ| ShowEditError[แสดง Error]
    ShowEditError --> ShowFilledForm
    ValidateEdit -->|ครบ| ShowEditConfirm[แสดง Modal ยืนยัน]
    ShowEditConfirm --> ConfirmEdit{ยืนยัน?}
    ConfirmEdit -->|ใช่| CallUpdateAPI[เรียก API แก้ไข]
    CallUpdateAPI --> UpdateResult{ผลลัพธ์?}
    UpdateResult -->|สำเร็จ| ShowEditSuccess[แสดง แก้ไขสำเร็จ]
    ShowEditSuccess --> GoToList[กลับหน้า POList]
    UpdateResult -->|ไม่สำเร็จ| ShowAPIError[แสดง Error จาก API]
    ShowAPIError --> ShowFilledForm
    ConfirmEdit -->|ไม่| ShowFilledForm

    EditAction -->|ยกเลิก| ClickCancel[กดปุ่ม กลับ]
    ClickCancel --> HasChanges{มีการแก้ไข?}
    HasChanges -->|มี| ShowDiscardConfirm[แสดง Modal ยืนยันยกเลิก]
    ShowDiscardConfirm --> ConfirmDiscard{ยกเลิกการแก้ไข?}
    ConfirmDiscard -->|ใช่| GoToList
    ConfirmDiscard -->|ไม่| ShowFilledForm
    HasChanges -->|ไม่มี| GoToList
```

---

## 4. สรุป Flow ทั้งหมด

```mermaid
flowchart TD
    subgraph Main["ระบบ PO"]
        Login([Login]) --> POList[หน้า POList]

        POList --> Create[สร้าง PO]
        POList --> View[ดูรายละเอียด]
        POList --> Edit[แก้ไข PO]
        POList --> Cancel[ยกเลิก PO]
        POList --> Approve[อนุมัติ]
        POList --> Reject[ปฏิเสธ]
        POList --> Print[พิมพ์]

        Create --> POForm[หน้า POForm]
        Edit --> POForm
        View --> POFormView[หน้า POForm - View Mode]

        POForm --> SaveSuccess{บันทึกสำเร็จ?}
        SaveSuccess -->|ใช่| POList
        SaveSuccess -->|ไม่| POForm

        POFormView --> POList

        Print --> PrintPreview[หน้า POPrintPreview]
        PrintPreview --> POList

        Cancel --> POList
        Approve --> POList
        Reject --> POList
    end
```

---

## 5. สถานะ PO และ Actions ที่ทำได้

```mermaid
stateDiagram-v2
    [*] --> Draft: สร้างใหม่

    Draft --> Draft: แก้ไข
    Draft --> WaitApprove: ส่งอนุมัติ
    Draft --> Cancelled: ยกเลิก

    WaitApprove --> Approved: อนุมัติ
    WaitApprove --> Rejected: ปฏิเสธ
    WaitApprove --> Cancelled: ยกเลิก

    Rejected --> Draft: แก้ไขใหม่
    Rejected --> Cancelled: ยกเลิก

    Approved --> [*]
    Cancelled --> [*]
```

| สถานะ | สร้าง | แก้ไข | ยกเลิก | อนุมัติ | ปฏิเสธ | พิมพ์ |
|-------|------|------|-------|--------|-------|------|
| Draft | - | ✅ | ✅ | - | - | ✅ |
| WaitApprove | - | ❌ | ✅ | ✅ | ✅ | ✅ |
| Approved | - | ❌ | ❌ | - | - | ✅ |
| Rejected | - | ✅ | ✅ | - | - | ✅ |
| Cancelled | - | ❌ | ❌ | - | - | ✅ |

---

*อัพเดทโดย: AI Assistant*
*สำหรับ: ปิงปอง* 📊
