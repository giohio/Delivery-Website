# API Keys Documentation

## Hệ thống API Keys cho Ứng dụng Bên Thứ 3

### 1. Tạo API Key

**Endpoint:** `POST /api/api-keys`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "key_name": "My App API Key",
  "permissions": ["orders:read", "orders:write"],
  "rate_limit": 1000,
  "expires_in_days": 365
}
```

**Response:**
```json
{
  "message": "API key created successfully",
  "api_key_id": 1,
  "api_key": "sk_xxxxxxxxxxxxxxxxxxxxx",
  "api_secret": "ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "key_name": "My App API Key",
  "permissions": ["orders:read", "orders:write"],
  "rate_limit": 1000,
  "expires_at": "2026-12-06T00:00:00",
  "created_at": "2025-12-06T15:30:00",
  "warning": "Save the API secret now. You will not be able to see it again!"
}
```

⚠️ **LƯU Ý:** API Secret chỉ hiển thị MỘT LẦN khi tạo. Lưu ngay!

---

### 2. Lấy Danh Sách API Keys

**Endpoint:** `GET /api/api-keys`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "api_keys": [
    {
      "api_key_id": 1,
      "key_name": "My App API Key",
      "api_key": "sk_xxxxxxxxxxxxxxxxxxxxx",
      "permissions": ["orders:read", "orders:write"],
      "is_active": true,
      "rate_limit": 1000,
      "last_used_at": "2025-12-06T14:25:00",
      "expires_at": "2026-12-06T00:00:00",
      "created_at": "2025-12-06T15:30:00"
    }
  ]
}
```

---

### 3. Cập Nhật API Key

**Endpoint:** `PUT /api/api-keys/<api_key_id>`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "key_name": "Updated Name",
  "permissions": ["orders:read"],
  "rate_limit": 500,
  "is_active": false
}
```

---

### 4. Xóa API Key

**Endpoint:** `DELETE /api/api-keys/<api_key_id>`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Sử Dụng API Key để Gọi External API

### Authentication Headers

Khi gọi các endpoint `/api/external/*`, thêm 2 headers:

```
X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxx
X-API-Secret: ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### External API Endpoints

#### 1. Lấy Danh Sách Orders

**Endpoint:** `GET /api/external/orders`

**Headers:**
```
X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxx
X-API-Secret: ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "order_id": 1,
      "pickup_address": "123 Nguyen Hue, District 1, HCMC",
      "delivery_address": "456 Le Loi, District 3, HCMC",
      "status": "PENDING",
      "price_estimate": 25000,
      "distance_km": 5.2,
      "created_at": "2025-12-06T10:00:00"
    }
  ],
  "count": 1
}
```

---

#### 2. Tạo Order Mới

**Endpoint:** `POST /api/external/orders`

**Headers:**
```
X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxx
X-API-Secret: ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

**Body:**
```json
{
  "pickup_address": "123 Nguyen Hue, District 1, HCMC",
  "delivery_address": "456 Le Loi, District 3, HCMC",
  "pickup_lat": 10.7769,
  "pickup_lng": 106.7009,
  "delivery_lat": 10.7681,
  "delivery_lng": 106.6828,
  "distance_km": 5.2,
  "price_estimate": 25000,
  "service_type": "bike",
  "package_size": "small",
  "notes": "Handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": 123,
    "status": "PENDING",
    "created_at": "2025-12-06T15:45:00"
  }
}
```

---

#### 3. Lấy Chi Tiết Order

**Endpoint:** `GET /api/external/orders/<order_id>`

**Headers:**
```
X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxx
X-API-Secret: ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "pickup_address": "123 Nguyen Hue, District 1, HCMC",
    "delivery_address": "456 Le Loi, District 3, HCMC",
    "status": "ASSIGNED",
    "price_estimate": 25000,
    "distance_km": 5.2,
    "service_type": "bike",
    "package_size": "small",
    "notes": "Handle with care",
    "created_at": "2025-12-06T15:45:00",
    "updated_at": "2025-12-06T15:50:00"
  }
}
```

---

## Permissions

API Keys có thể có các permissions sau:

- `orders:read` - Đọc orders
- `orders:write` - Tạo orders mới
- `deliveries:read` - Đọc deliveries
- `wallet:read` - Đọc wallet balance
- `notifications:read` - Đọc notifications

---

## Rate Limiting

- Mặc định: 1000 requests/hour
- Có thể tùy chỉnh khi tạo API key

---

## Security Best Practices

1. ⚠️ **KHÔNG BAO GIỜ** commit API keys vào Git
2. 🔒 Lưu API Secret an toàn (chỉ hiển thị 1 lần)
3. 🔄 Rotate API keys định kỳ
4. 🚫 Revoke ngay nếu bị lộ
5. ✅ Chỉ cấp permissions cần thiết

---

## Example cURL Commands

### Tạo API Key
```bash
curl -X POST http://localhost:5000/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key_name": "My App",
    "permissions": ["orders:read", "orders:write"],
    "rate_limit": 1000
  }'
```

### Gọi External API
```bash
curl -X GET http://localhost:5000/api/external/orders \
  -H "X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxx" \
  -H "X-API-Secret: ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Tạo Order qua External API
```bash
curl -X POST http://localhost:5000/api/external/orders \
  -H "X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxx" \
  -H "X-API-Secret: ss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_address": "123 Nguyen Hue, District 1, HCMC",
    "delivery_address": "456 Le Loi, District 3, HCMC",
    "distance_km": 5.2,
    "price_estimate": 25000
  }'
```
