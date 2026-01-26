# Payment Slip Upload - API Integration Guide

## API Endpoint Documentation

Based on the Swagger/OpenAPI specification:

### Endpoint Details
- **URL**: `POST /api/Payment/{id}/slip`
- **Path Parameter**: `id` (integer, int32) - The payment ID
- **Content-Type**: `multipart/form-data`
- **Request Body**: 
  - Field name: `file`
  - Type: `string($binary)` (binary file data)

### Response Format
**Status Code**: `200 OK`  
**Content-Type**: `text/plain` or `application/json`

**Response Structure**:
```json
{
  "success": true,
  "message": "string",
  "data": "string",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ],
  "details": "string",
  "statusCode": 0,
  "timestamp": "2025-12-12T06:39:39.436Z"
}
```

## Current Implementation

### Request Format ✅
```typescript
const formData = new FormData();
formData.append('file', paymentSlipFile);

const res = await fetch(`http://51.75.119.133:5243/api/Payment/${paymentId}/slip`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // Content-Type is auto-set by browser for FormData
  },
  body: formData
});
```

### Response Handling ✅
```typescript
if (res.ok) {
  const text = await res.text();
  const responseData = JSON.parse(text);
  
  // Check API's success field
  if (responseData.success === false) {
    // Handle API-level error
    alert(`Upload failed: ${responseData.message}`);
    return false;
  }
  
  return true;
}
```

## Debugging Checklist

When testing the upload, verify these in the console logs:

### 1. Request Details
```
📤 Uploading payment slip: {
  paymentId: <number>,
  fileName: "example.jpg",
  fileType: "image/jpeg",
  fileSize: "123.45 KB",
  url: "http://51.75.119.133:5243/api/Payment/<id>/slip"
}
```

**Check**:
- ✅ Payment ID is a valid number (not null/undefined)
- ✅ File name is correct
- ✅ File type is acceptable (image/jpeg, image/png, application/pdf, etc.)
- ✅ File size is reasonable (< 10MB)

### 2. Response Details
```
📥 Upload response received: {
  status: 200,
  statusText: "OK",
  ok: true,
  type: "cors",
  url: "http://51.75.119.133:5243/api/Payment/<id>/slip",
  redirected: false,
  headers: {
    contentType: "application/json",
    contentLength: "123",
    server: "Kestrel"
  }
}
```

**Check**:
- ✅ `status` should be `200`
- ✅ `ok` should be `true`
- ✅ `contentType` should be `application/json` or `text/plain`

### 3. Success Response Body
```
📄 Success response body: {"success":true,"message":"File uploaded successfully","data":"..."}
✅ Payment slip upload response: {
  success: true,
  message: "File uploaded successfully",
  data: "...",
  errors: [],
  details: "",
  statusCode: 200,
  timestamp: "2025-12-12T06:39:39.436Z"
}
```

**Check**:
- ✅ `success` field is `true`
- ✅ `message` contains success confirmation
- ✅ No errors in `errors` array

### 4. Error Response (if upload fails)
```
📄 Raw error response body: {"success":false,"message":"Invalid file format","errors":[...]}
❌ Upload failed - Complete details: {
  status: 400,
  statusText: "Bad Request",
  contentType: "application/json",
  bodyLength: 123,
  bodyPreview: "{\"success\":false,\"message\":\"Invalid file format\"...",
  url: "http://51.75.119.133:5243/api/Payment/123/slip",
  paymentId: 123
}
```

**Check**:
- ❌ `status` is not `200` (e.g., 400, 404, 500)
- ❌ Response body contains error details
- ❌ `success` field is `false`

## Common Error Scenarios

### 1. Payment ID Not Found (404)
**Cause**: The payment ID doesn't exist in the database  
**Solution**: Verify payment was created successfully before attempting upload

**Console Output**:
```
❌ Upload failed - Complete details: {
  status: 404,
  statusText: "Not Found",
  bodyPreview: "Payment not found"
}
```

### 2. Invalid File Format (400)
**Cause**: File type not accepted by server  
**Solution**: Check accepted file types (usually jpg, png, pdf)

**Console Output**:
```
❌ Upload failed - Complete details: {
  status: 400,
  statusText: "Bad Request",
  bodyPreview: "{\"success\":false,\"message\":\"Invalid file format\"}"
}
```

### 3. File Too Large (413)
**Cause**: File exceeds server's size limit  
**Solution**: Compress or resize the file

**Console Output**:
```
❌ Upload failed - Complete details: {
  status: 413,
  statusText: "Payload Too Large"
}
```

### 4. Unauthorized (401)
**Cause**: Auth token expired or invalid  
**Solution**: User needs to log in again

**Console Output**:
```
❌ Upload failed - Complete details: {
  status: 401,
  statusText: "Unauthorized"
}
```

### 5. Server Error (500)
**Cause**: Backend error (database, file system, etc.)  
**Solution**: Check backend logs

**Console Output**:
```
❌ Upload failed - Complete details: {
  status: 500,
  statusText: "Internal Server Error",
  bodyPreview: "{\"success\":false,\"message\":\"Failed to save file\"}"
}
```

## Testing Steps

1. **Select an invoice** from the list
2. **Click "Make Payment"** button
3. **Fill in payment details**:
   - Payment date
   - Reference number
   - Comments
4. **Attach a payment slip** (image or PDF file)
5. **Submit the payment**
6. **Open browser console** (F12 → Console tab)
7. **Look for the logs** with emoji prefixes:
   - 💳 Payment creation
   - 📤 Upload attempt
   - 📥 Upload response
   - ✅ Success or ❌ Error

## What to Share for Debugging

If the upload still fails, please share:

1. **The complete console output** from the upload attempt
2. **The HTTP status code** (from "Upload response received")
3. **The response body** (from "Success response body" or "Raw error response body")
4. **The payment ID** being used
5. **File details** (name, type, size)

## Expected Successful Flow

```
💳 Creating payment for invoice: 123
✅ Payment creation response: {...}
🔑 Extracted payment ID: 456
⏳ Waiting for payments to be processed...
📎 Starting payment slip uploads...
📤 Attempting to upload slip for payment ID: 456
📤 Uploading payment slip: {
  paymentId: 456,
  fileName: "receipt.jpg",
  fileType: "image/jpeg",
  fileSize: "234.56 KB",
  url: "http://51.75.119.133:5243/api/Payment/456/slip"
}
📥 Upload response received: {
  status: 200,
  statusText: "OK",
  ok: true,
  ...
}
📄 Success response body: {"success":true,"message":"File uploaded successfully",...}
✅ Payment slip upload response: {success: true, message: "File uploaded successfully", ...}
✅ Slip uploaded successfully for payment 456
```

## Files Modified

- `app/buyer/invoices/page.tsx`
  - Enhanced `uploadPaymentSlip` function with comprehensive logging
  - Proper handling of API response structure
  - Better error messages for users
  - Defensive parsing of response data
