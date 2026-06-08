#โปรเจคนี้ยังอยู่ในขั้นตอน Development อยู่ / Branch Developer จะเป็น Branch หลักสำหรับการพัฒนาซอร์สโค้ด ก่อนที่จะทำการ Merge หรือ Pull Request ขึ้นไปยัง branch main

---
# 🏥 MedCare Clinic — ระบบจองคิวและบริหารจัดการคลินิกออนไลน์

ระบบจัดการคลินิกแบบครบวงจร พัฒนาด้วย React.js + Express.js + MySQL  
รองรับทั้งฝั่งผู้ป่วย (จองคิว, ดูประวัติรักษา) และฝั่งแพทย์ (จัดการคิว, บันทึกผลการรักษา)


---

## 🩺 เกี่ยวกับโปรเจกต์

MedCare Clinic เป็น Web Application สำหรับระบบจองคิวและดูประวัติการรักษาของคลินิก
ผู้ป่วยสามารถเข้าสู่ระบบด้วยหมายเลข HN เลือกแพทย์ เลือกเวลานัด
และดูประวัติการรักษาย้อนหลังได้ทันที

---

## ⚙️ การติดตั้ง

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/SEROs0/Project-MCC.git
cd Project-MCC
```

### 2. ติดตั้ง Frontend

```bash
cd mcc-frontend
npm install
```

### 3. ติดตั้ง Backend

```bash
cd mcc-backend
npm install
```

### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน `mcc-backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mcc_project
PORT=8080
```

รันโปรเจกต์

เปิด 2 terminal แยกกัน:

```bash
# Terminal 1 — Backend
cd mcc-backend
node server.js

# Terminal 2 — Frontend
cd mcc-frontend
npm start
```

## 🔑 ข้อมูล Login สำหรับทดสอบ

### ผู้ป่วย (เข้าด้วยหมายเลข HN | เข้าที่ path `/login` | ตัวอย่าง path`http://localhost:3000/login`)

| HN | ชื่อ | หมายเหตุ |
|----|------|---------|
| `HN0001` | สมหมาย ใจดี | ข้อมูลปกติ |
| `HN0002` | วิภา ดีงาม | มีประวัติแพ้ยา (เพนิซิลิน) |
| `HN0003` | ประสิทธิ์ มั่นคง | โรคประจำตัว เบาหวาน + ความดัน |
| `HN0004` | นภา สว่างใจ | แพ้แอสไพริน, มีไมเกรน |
| `HN0005` | สุรชัย พลังดี | ข้อมูลปกติ |

### แพทย์ (เข้าที่ path `/doctor-login`| ตัวอย่าง path`http://localhost:3000/doctor-login`)

| Employee ID | Password | ชื่อ | แผนก |
|-------------|----------|------|------|
| `DR001` | `doctor001` | นพ.สมชาย รักษาดี | เวชกรรมทั่วไป |
| `DR002` | `doctor002` | พญ.วิภา สุขภาพดี | อายุรกรรม |
| `DR003` | `doctor003` | นพ.ประสิทธิ์ กระดูกดี | กระดูกและข้อ |

## 👨‍💻 ผู้พัฒนา

พัฒนาเพื่อเป็น Portfolio Project แสดงทักษะ Full Stack Web Development (React + Node.js + MySQL)
