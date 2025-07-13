# Restaurant Inventory Management System

ระบบจัดการสต็อกสำหรับร้านอาหาร - Web-based application สำหรับจัดการวัตถุดิบ สต็อก และต้นทุนสำหรับร้านอาหารที่มีหลายสาขา

## 🎯 Features

- 🏪 **Multi-Store Management** - รองรับการจัดการหลายสาขาและคลังกลาง
- 📦 **Inventory Control** - ระบบจัดการสต็อกแบบ Real-time
- 🔄 **Stock Transfer** - โอนย้ายสต็อกระหว่างสาขา
- 📊 **Recipe & Costing** - จัดการสูตรอาหารและคำนวณต้นทุน
- 📈 **Reports & Analytics** - รายงานเชิงลึกสำหรับการตัดสินใจ
- 📱 **Mobile-First Design** - ใช้งานสะดวกบนทุกอุปกรณ์
- 🔐 **Role-Based Access** - ระบบสิทธิ์การใช้งานตามบทบาท

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/restaurant-inventory-system.git
cd restaurant-inventory-system
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env file if needed
npm run dev
```

### 4. Database Setup
```bash
# Run the SQL script to create database and tables
mysql -u root -p < backend/database/schema.sql
```

## 📂 Project Structure

```
restaurant-inventory-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── .env.example
└── README.md
```

## 📝 License

This project is licensed under the ISC License.
