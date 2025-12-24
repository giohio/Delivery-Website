# Hướng dẫn cài đặt và chạy Frontend

## Bước 1: Cài đặt dependencies

Mở terminal trong thư mục `frontend` và chạy:

```bash
npm install
```

## Bước 2: Chạy development server

```bash
npm run dev
```

Website sẽ chạy tại: `http://localhost:3000`

## Bước 3: Build cho production (tùy chọn)

```bash
npm run build
```

File build sẽ được tạo trong thư mục `dist/`

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── sections/        # Các section của landing page
│   │   ├── pages/           # LandingPage component
│   │   └── ui/              # UI components dùng chung
│   ├── styles/
│   │   └── global.css       # Global styles + Tailwind
│   ├── App.tsx              # Main app với routing
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Các tính năng chính

### Landing Page Sections:
1. **Hero Section** - Banner chính với form ước tính giá
2. **Benefits Section** - 4 lợi ích chính
3. **How It Works** - 4 bước hoạt động
4. **Pricing Section** - 3 gói dịch vụ
5. **Tracking Section** - Form tra cứu đơn hàng
6. **Driver & Merchant Sections** - Thông tin cho tài xế và người bán
7. **Social Proof** - Thống kê
8. **FAQ Section** - Câu hỏi thường gặp

### Components:
- **Header** - Navigation bar với scroll effect
- **Footer** - Footer với links và thông tin liên hệ

## Troubleshooting

### Lỗi: Cannot find module 'lucide-react'
```bash
npm install lucide-react
```

### Lỗi: Tailwind CSS không hoạt động
Đảm bảo file `global.css` đã được import trong `main.tsx`:
```typescript
import './styles/global.css';
```

### Port 3000 đã được sử dụng
Thay đổi port trong `vite.config.ts`:
```typescript
server: {
  port: 5173, // Đổi sang port khác
}
```

## Customization

### Thay đổi màu sắc
Chỉnh sửa `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Thêm section mới
1. Tạo file trong `src/components/sections/`
2. Import và thêm vào `LandingPage.tsx`

## Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Node.js version >= 18
2. Đã chạy `npm install`
3. Không có lỗi trong console
