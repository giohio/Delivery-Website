# Hướng dẫn cài đặt Firebase Authentication

## Bước 1: Cài đặt Firebase SDK

Chạy lệnh sau trong terminal (thư mục `frontend`):

```bash
npm install firebase
```

## Bước 2: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Thêm dự án"**
3. Nhập tên project: `FastDelivery` (hoặc tên bạn muốn)
4. Tắt Google Analytics nếu không cần (hoặc bật nếu muốn)
5. Click **"Create project"**

## Bước 3: Thêm Web App vào Firebase Project

1. Trong Firebase Console, click vào icon **Web** (</>) để thêm app
2. Nhập App nickname: `FastDelivery Web`
3. **KHÔNG** check "Also set up Firebase Hosting"
4. Click **"Register app"**
5. Copy toàn bộ `firebaseConfig` object

## Bước 4: Cấu hình Firebase trong code

Mở file `src/config/firebase.ts` và thay thế các giá trị:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // Thay bằng API Key của bạn
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Bước 5: Bật Google Authentication

1. Trong Firebase Console, vào **Authentication** > **Sign-in method**
2. Click vào **Google**
3. Bật **Enable**
4. Chọn **Project support email** (email của bạn)
5. Click **Save**

## Bước 6: Bật Facebook Authentication

### 6.1. Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** > **"Create App"**
3. Chọn **"Consumer"** > Click **"Next"**
4. Nhập App name: `FastDelivery`
5. Nhập App contact email
6. Click **"Create App"**

### 6.2. Cấu hình Facebook Login

1. Trong Facebook App Dashboard, vào **"Add Product"**
2. Tìm **"Facebook Login"** > Click **"Set Up"**
3. Chọn **"Web"**
4. Nhập Site URL: `http://localhost:5173` (cho development)
5. Click **"Save"** > **"Continue"**

### 6.3. Lấy App ID và App Secret

1. Vào **Settings** > **Basic**
2. Copy **App ID**
3. Click **"Show"** để xem **App Secret** > Copy

### 6.4. Cấu hình trong Firebase

1. Quay lại Firebase Console > **Authentication** > **Sign-in method**
2. Click vào **Facebook**
3. Bật **Enable**
4. Paste **App ID** và **App Secret** từ Facebook
5. Copy **OAuth redirect URI** từ Firebase
6. Click **Save**

### 6.5. Thêm OAuth Redirect URI vào Facebook

1. Quay lại Facebook App Dashboard
2. Vào **Facebook Login** > **Settings**
3. Trong **Valid OAuth Redirect URIs**, paste URI từ Firebase
4. Click **"Save Changes"**

### 6.6. Đưa App lên Live Mode (Quan trọng!)

1. Trong Facebook App Dashboard, click nút **"App Mode"** ở góc trên
2. Chuyển từ **"Development"** sang **"Live"**
3. Điền đầy đủ thông tin yêu cầu (Privacy Policy URL, Terms of Service URL)

## Bước 7: Thêm Authorized Domains

1. Trong Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Thêm domain của bạn (ví dụ: `yourdomain.com`)
3. `localhost` đã được thêm sẵn cho development

## Bước 8: Test Authentication

1. Chạy app: `npm run dev`
2. Truy cập `http://localhost:5173/login`
3. Click **"Log in with Google"** hoặc **"Log in with Facebook"**
4. Đăng nhập với tài khoản của bạn
5. Kiểm tra xem có redirect về Landing Page với tên user không

## Lưu ý quan trọng

### Cho Development:
- Sử dụng `http://localhost:5173` trong Facebook App Settings
- Firebase tự động cho phép localhost

### Cho Production:
- Thêm domain thực của bạn vào:
  - Firebase Authorized domains
  - Facebook Valid OAuth Redirect URIs
- Cập nhật Site URL trong Facebook App Settings

## Xử lý lỗi thường gặp

### Lỗi: "This app is not approved for login with Facebook"
- Đảm bảo Facebook App đã ở chế độ **Live**
- Kiểm tra OAuth Redirect URI đã đúng

### Lỗi: "auth/unauthorized-domain"
- Thêm domain vào Firebase Authorized domains

### Lỗi: "auth/popup-blocked"
- Cho phép popup trong trình duyệt
- Hoặc sử dụng `signInWithRedirect` thay vì `signInWithPopup`

## File cấu hình đã tạo

- ✅ `src/config/firebase.ts` - Firebase configuration
- ✅ `src/services/authService.ts` - Authentication service
- ✅ `src/pages/Login.tsx` - Updated with Firebase auth
- ✅ `src/pages/SignUp.tsx` - Updated with Firebase auth

## Tính năng đã hoàn thành

- ✅ Google Sign In/Sign Up
- ✅ Facebook Sign In/Sign Up
- ✅ Lưu user info vào AuthContext
- ✅ Redirect về Landing Page sau khi login
- ✅ Hiển thị user info trên Header
- ✅ Loading state và error handling
- ✅ Logout functionality

Chúc bạn thành công! 🎉
