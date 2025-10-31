# 🔀 Multi-Tab Authentication - Tab-Specific Login

## 🎯 Vấn đề đã giải quyết:

**Trước:**
```
Tab 1: Login customer → localStorage saves customer
Tab 2: Login shipper → localStorage overrides to shipper
Tab 1: Reload → ❌ Becomes shipper (wrong!)
```

**Bây giờ:**
```
Tab 1: Login customer → sessionStorage + localStorage
Tab 2: Login shipper → sessionStorage (riêng tab 2) + localStorage
Tab 1: Reload → ✅ Still customer (correct!)
Tab 2: Reload → ✅ Still shipper (correct!)
```

---

## 🔧 Giải pháp: sessionStorage + localStorage

### **sessionStorage** (Tab-specific)
- Mỗi tab có storage riêng
- Mất khi đóng tab
- **Ưu tiên** khi check auth

### **localStorage** (Shared across tabs)
- Share giữa tất cả tabs
- Persist sau khi đóng browser
- **Fallback** khi sessionStorage empty

---

## 📊 Flow Diagram

### Login Flow:
```
Login in Tab 1
    ↓
Save to sessionStorage (Tab 1 only)
Save to localStorage (All tabs)
    ↓
Tab 1 has customer in sessionStorage
```

### Tab 2 Login:
```
Login in Tab 2
    ↓
Save to sessionStorage (Tab 2 only) ← Independent!
Update localStorage (All tabs) ← Override
    ↓
Tab 2 has shipper in sessionStorage
```

### Reload Tab 1:
```
Check sessionStorage first
    ↓
Found customer in sessionStorage ✅
    ↓
Use customer (ignore localStorage)
```

### Reload Tab 2:
```
Check sessionStorage first
    ↓
Found shipper in sessionStorage ✅
    ↓
Use shipper (ignore localStorage)
```

---

## 🎬 Scenarios

### Scenario 1: Multiple roles in different tabs
```
1. Open Tab 1 → Login customer
2. Open Tab 2 → Login shipper
3. Open Tab 3 → Login merchant
4. Reload all tabs
   ✅ Tab 1: Still customer
   ✅ Tab 2: Still shipper
   ✅ Tab 3: Still merchant
```

### Scenario 2: Close and reopen single tab
```
1. Tab 1: Login customer
2. Close Tab 1
3. Open new tab → Go to /
4. ✅ Auto-login as customer (from localStorage)
```

### Scenario 3: Close all tabs and reopen browser
```
1. Login customer in Tab 1
2. Close entire browser
3. Reopen browser → Go to /
4. ✅ Auto-login as customer (from localStorage)
```

### Scenario 4: Logout in one tab
```
1. Tab 1: Customer logged in
2. Tab 2: Shipper logged in
3. Tab 1: Click logout
   ✅ Tab 1: Logged out
   ✅ Tab 2: Still logged in as shipper
```

---

## 💾 Storage Strategy

### On Login:
```javascript
// Tab-specific (this tab only)
sessionStorage.setItem('user', userData);
sessionStorage.setItem('token', token);
sessionStorage.setItem('lastPath', '/customer');

// Shared (all tabs, for persistence)
localStorage.setItem('user', userData);
localStorage.setItem('token', token);
localStorage.setItem('lastPath', '/customer');
```

### On Load:
```javascript
// Priority 1: Check sessionStorage (tab-specific)
let user = sessionStorage.getItem('user');
let token = sessionStorage.getItem('token');

// Priority 2: Fallback to localStorage
if (!user || !token) {
  user = localStorage.getItem('user');
  token = localStorage.getItem('token');
  
  // Copy to sessionStorage for this tab
  if (user && token) {
    sessionStorage.setItem('user', user);
    sessionStorage.setItem('token', token);
  }
}
```

### On Logout:
```javascript
// Clear both storages
sessionStorage.clear();
localStorage.clear();
```

---

## 🎯 Use Cases

### Use Case 1: Developer Testing
```
Developer needs to test multiple roles simultaneously:
- Tab 1: Test customer flow
- Tab 2: Test shipper accepting orders
- Tab 3: Test merchant creating orders
✅ Each tab maintains its own session
```

### Use Case 2: Customer Support
```
Support agent helps multiple users:
- Tab 1: Customer account A
- Tab 2: Customer account B
- Tab 3: Admin dashboard
✅ Can switch between accounts easily
```

### Use Case 3: Demo/Presentation
```
Present different user perspectives:
- Tab 1: Customer creates order
- Tab 2: Shipper accepts order
- Tab 3: Admin monitors
✅ Live demo without logout/login
```

---

## 🔄 Complete Flow Examples

### Example 1: Two tabs, different roles

```
TIME    | TAB 1 (Customer)        | TAB 2 (Shipper)         | localStorage
--------|-------------------------|-------------------------|---------------
00:00   | Open                    | -                       | empty
00:05   | Login customer          | -                       | customer
        | sessionStorage: customer| -                       |
00:10   | -                       | Open                    | customer
00:15   | -                       | Login shipper           | shipper (overridden)
        | sessionStorage: customer| sessionStorage: shipper |
00:20   | Reload → customer ✅    | -                       | shipper
00:25   | -                       | Reload → shipper ✅     | shipper
```

### Example 2: Close tab and reopen

```
TIME    | TAB 1                   | sessionStorage | localStorage
--------|-------------------------|----------------|-------------
00:00   | Login customer          | customer       | customer
00:05   | Close tab               | cleared        | customer
00:10   | Open new tab            | empty          | customer
00:15   | Load → customer ✅      | customer       | customer
        | (copied from localStorage)
```

---

## 🎨 Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Window                        │
├──────────────────────────┬──────────────────────────────────┤
│         Tab 1            │           Tab 2                  │
│  ┌──────────────────┐    │    ┌──────────────────┐         │
│  │  sessionStorage  │    │    │  sessionStorage  │         │
│  │  ┌────────────┐  │    │    │  ┌────────────┐  │         │
│  │  │ customer   │  │    │    │  │ shipper    │  │         │
│  │  │ token123   │  │    │    │  │ token456   │  │         │
│  │  └────────────┘  │    │    │  └────────────┘  │         │
│  └──────────────────┘    │    └──────────────────┘         │
│                          │                                  │
│  Customer Dashboard      │    Shipper Dashboard             │
└──────────────────────────┴──────────────────────────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │    localStorage        │
               │  (Shared, Last Write)  │
               │  ┌──────────────────┐  │
               │  │   shipper        │  │ ← Last login wins
               │  │   token456       │  │
               │  └──────────────────┘  │
               └────────────────────────┘
```

---

## 🔒 Security Considerations

### ✅ Benefits:
1. **Tab Isolation** - Each tab has independent session
2. **Persistence** - Still works after browser restart
3. **Flexibility** - Can test multiple roles

### ⚠️ Considerations:
1. **Token Sharing** - Same token in multiple tabs
2. **Logout Sync** - Logout in one tab doesn't affect others
3. **Data Consistency** - localStorage might have different role

### 🛡️ Best Practices:
1. Always check sessionStorage first
2. Copy to sessionStorage on page load
3. Clear both storages on logout
4. Validate token before API calls

---

## 🧪 Testing Guide

### Test 1: Basic Multi-Tab
```
1. Open Tab 1
2. Login customer1
3. Open Tab 2 (Ctrl+T)
4. Login shipper1
5. Reload Tab 1
   ✅ Still customer
6. Reload Tab 2
   ✅ Still shipper
```

### Test 2: Close and Reopen
```
1. Tab 1: Login customer
2. Close Tab 1
3. Open new tab
4. Go to http://localhost:5173/
   ✅ Auto-login as customer
```

### Test 3: Logout in One Tab
```
1. Tab 1: Login customer
2. Tab 2: Login shipper
3. Tab 1: Logout
4. Tab 1: Shows login page ✅
5. Tab 2: Still logged in as shipper ✅
```

### Test 4: Three Different Roles
```
1. Tab 1: customer
2. Tab 2: shipper
3. Tab 3: merchant
4. Reload all
   ✅ Each maintains its role
```

---

## 📝 Code Changes

### AuthContext.tsx

```typescript
// Load priority: sessionStorage → localStorage
const savedUser = sessionStorage.getItem('user') 
  || localStorage.getItem('user');

// On login: save to both
sessionStorage.setItem('user', userData);
localStorage.setItem('user', userData);

// On logout: clear both
sessionStorage.clear();
localStorage.clear();

// getToken: check both
getToken() {
  return sessionStorage.getItem('token') 
    || localStorage.getItem('token');
}
```

---

## ✅ Benefits

1. **Multi-Role Testing** - Test different roles simultaneously
2. **Tab Independence** - Each tab has its own session
3. **Persistence** - Session survives browser restart
4. **Developer Friendly** - Easy to test flows
5. **User Friendly** - Natural tab behavior

---

## 🎉 Result

**Bây giờ có thể mở nhiều tabs với các roles khác nhau!**

Each tab will:
- ✅ Keep its own login session
- ✅ Survive reload
- ✅ Not interfere with other tabs
- ✅ Auto-restore from localStorage if new tab

**Perfect for development and testing!** 🚀

---

## 💡 When to Use

### Use Multi-Tab Auth When:
- Testing multiple roles
- Customer support (multiple users)
- Development/debugging
- Presentations/demos

### Single Tab Auth When:
- Production (most users)
- Mobile devices
- Single-user scenarios

---

**Multi-tab authentication now works perfectly!** ✨
