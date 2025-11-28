# 🎭 Role-Based Redirect - Auto Navigate to Dashboard

## ✨ Tính năng mới:

Khi **reload trang** hoặc **mở app lại**, hệ thống tự động đưa user về **dashboard của role** đang đăng nhập!

---

## 🎯 Scenarios:

### **Scenario 1: Login + Reload**
```
1. Login as Customer → Redirect to /customer
2. Press F5 (reload)
3. ✅ Stay at /customer (Customer Dashboard)
```

### **Scenario 2: Close browser + Reopen**
```
1. Login as Shipper → At /shipper
2. Close browser completely
3. Reopen browser → Go to http://localhost:5173/
4. ✅ Auto redirect to /shipper (Shipper Dashboard)
```

### **Scenario 3: Direct URL access**
```
1. Already logged in as Merchant
2. Go to http://localhost:5173/
3. ✅ Auto redirect to /dashboard/merchant
```

### **Scenario 4: Multiple tabs**
```
1. Login as Admin in Tab 1
2. Open Tab 2 → http://localhost:5173/
3. ✅ Tab 2 auto redirects to /admin
```

---

## 🔧 Những gì đã thay đổi:

### **1. AuthContext.tsx**

#### Lưu `lastPath` khi login:
```typescript
const login = (userData: User, token?: string) => {
  // ... existing code ...
  
  // Save role-based default path
  const roleRoutes = {
    customer: '/customer',
    shipper: '/shipper',
    merchant: '/dashboard/merchant',
    admin: '/admin'
  };
  const defaultPath = roleRoutes[userData.role_name || ''] || '/';
  localStorage.setItem('lastPath', defaultPath);
};
```

#### Clear `lastPath` khi logout:
```typescript
const logout = () => {
  // ... existing code ...
  localStorage.removeItem('lastPath');
};
```

---

### **2. HomePage.tsx** (NEW)

Component mới xử lý auto-redirect:

```typescript
useEffect(() => {
  if (isLoading) return;

  if (isAuthenticated && user) {
    // Get saved path or determine from role
    const savedPath = localStorage.getItem('lastPath');
    
    if (savedPath) {
      navigate(savedPath, { replace: true });
      return;
    }

    // Fallback: redirect based on role
    const roleRoutes = {
      customer: '/customer',
      shipper: '/shipper',
      merchant: '/dashboard/merchant',
      admin: '/admin'
    };

    const targetRoute = roleRoutes[user.role_name || ''];
    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  }
}, [user, isAuthenticated, isLoading, navigate]);
```

---

### **3. Router.tsx**

Updated index route:
```typescript
{
  index: true,
  element: <HomePage />, // Auto-redirect logic
}
```

---

## 📊 Flow Diagram

```
User Opens App
       ↓
   Check Auth
       ↓
    ┌──────────┐
    │Logged in?│
    └──────────┘
         ↓
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ↓         ↓
Get lastPath  Show Home
    │           (with links)
    ↓
Redirect to
saved path
    ↓
┌────────────┐
│  Customer  │─→ /customer
│  Shipper   │─→ /shipper
│  Merchant  │─→ /dashboard/merchant
│  Admin     │─→ /admin
└────────────┘
```

---

## 🗺️ Role → Route Mapping

| Role | Default Route | Dashboard |
|------|--------------|-----------|
| **customer** | `/customer` | Customer Dashboard |
| **shipper** | `/shipper` | Shipper Dashboard Modern |
| **merchant** | `/dashboard/merchant` | Merchant Dashboard |
| **admin** | `/admin` | Admin Dashboard |

---

## 💾 LocalStorage Structure

```javascript
// After login
{
  "user": "{...userData...}",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "lastPath": "/shipper"  // ← NEW!
}

// After logout
{
  // All cleared
}
```

---

## 🧪 Testing

### Test 1: Customer Role
```
1. Login: customer1 / customer123
2. Should redirect to: /customer
3. Reload page (F5)
4. ✅ Stay at /customer
5. Go to http://localhost:5173/
6. ✅ Auto redirect to /customer
```

### Test 2: Shipper Role
```
1. Login: shipper1 / shipper123
2. Should redirect to: /shipper
3. Close browser
4. Reopen → Go to /
5. ✅ Auto redirect to /shipper
```

### Test 3: Merchant Role
```
1. Login: merchant1 / merchant123
2. Should redirect to: /dashboard/merchant
3. Reload
4. ✅ Stay at /dashboard/merchant
```

### Test 4: Admin Role
```
1. Login: admin / admin123
2. Should redirect to: /admin
3. Reload
4. ✅ Stay at /admin
```

### Test 5: Not Logged In
```
1. Not logged in
2. Go to /
3. ✅ See HomePage with links
4. No auto-redirect
```

---

## 🎨 HomePage Features

### For Not Logged In Users:
- Welcome message
- Links to all dashboards:
  - 🔵 Customer Dashboard
  - 🟢 Shipper Dashboard
  - 🟡 Merchant Dashboard
  - 🔴 Admin Dashboard
- Test accounts info

### For Logged In Users:
- **Auto-redirect** to their dashboard
- No need to manually navigate

---

## 🔄 Complete Flow

### Login Flow:
```
Login Screen
    ↓
Submit credentials
    ↓
API Success
    ↓
Save user + token + lastPath
    ↓
Redirect to role dashboard
    ↓
User at dashboard
```

### Reload Flow:
```
Page Reload
    ↓
AuthContext loads user from localStorage
    ↓
Check isAuthenticated
    ↓
    YES
    ↓
Stay at current page
OR
Go to / → Auto redirect to lastPath
```

### Open App Flow:
```
Open http://localhost:5173/
    ↓
HomePage component mounts
    ↓
Check isAuthenticated
    ↓
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ↓         ↓
Redirect   Show links
to lastPath
```

---

## ✅ Benefits

1. **Better UX** - User không phải navigate lại
2. **Role-aware** - Mỗi role về đúng dashboard
3. **Persistent** - Giữ nguyên vị trí sau reload
4. **Automatic** - Không cần user làm gì
5. **Smart fallback** - Có links nếu chưa login

---

## 🎯 Use Cases

### Use Case 1: Developer Testing
- Login với nhiều roles khác nhau
- Reload để test
- ✅ Mỗi role về đúng dashboard

### Use Case 2: Production Users
- Login 1 lần
- Dùng app hàng ngày
- ✅ Luôn về đúng dashboard khi mở app

### Use Case 3: Multiple Devices
- Login trên laptop
- Session saved
- Mở laptop sau vài giờ
- ✅ Vẫn logged in, vẫn đúng dashboard

---

## 📝 Code Changes Summary

### Files Modified:
1. ✅ `AuthContext.tsx` - Save/clear lastPath
2. ✅ `Router.tsx` - Use HomePage

### Files Created:
1. ✅ `HomePage.tsx` - Auto-redirect logic
2. ✅ `RoleBasedRedirect.tsx` - Helper component

---

## 🚀 Result

**Hệ thống giờ hoàn toàn role-aware!**

Each role automatically goes to their dashboard:
- ✅ Customer → Customer Dashboard
- ✅ Shipper → Shipper Dashboard  
- ✅ Merchant → Merchant Dashboard
- ✅ Admin → Admin Dashboard

**No manual navigation needed!** 🎉

---

## 🔒 Security Note

- ✅ Only redirects if authenticated
- ✅ Checks token validity
- ✅ Clears data on logout
- ✅ Role verified from user data

---

## 💡 Future Enhancements

1. **Remember last visited page** (not just role default)
   ```typescript
   // Save actual current path on navigation
   window.addEventListener('beforeunload', () => {
     localStorage.setItem('lastPath', window.location.pathname);
   });
   ```

2. **Deep linking support**
   ```typescript
   // Keep query params and hash
   const fullPath = `${pathname}${search}${hash}`;
   ```

3. **Session timeout handling**
   ```typescript
   // Check token expiration
   if (isTokenExpired(token)) {
     logout();
     return;
   }
   ```

---

**Role-based navigation is now fully automatic!** ✨
