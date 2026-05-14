# 🧪 TESTING GUIDE - Room Booking System

## Prerequisites

- Django backend running: `python manage.py runserver` (Port 8000)
- React frontend running: `npm run dev` (Port 5173)
- Database populated with rooms (already done ✅)

---

## 📋 STEP-BY-STEP TESTING

### 1️⃣ Test Backend API Directly

Open in browser to verify backend is working:

```
http://localhost:8000/api/rooms/
```

Should see JSON array of 7 rooms with amenities. If not:

- Check terminal for backend errors
- Verify database has rooms: `python manage.py shell`
  ```python
  from core.models import Room
  Room.objects.count()  # Should be 7
  ```

---

### 2️⃣ Register New Account

1. Go to: `http://localhost:5173/register`
2. Fill form:
   - **Full Name:** Test User
   - **Email:** testuser@example.com
   - **Password:** TestPass123
3. Click "Create Account"
4. Check browser console (F12) for any errors
   - Should see API call: `POST /auth/register/`
   - If successful → redirects to login

**Expected Response:**

```json
{
  "user": {
    "id": X,
    "username": "testuser",
    "email": "testuser@example.com",
    ...
  },
  "message": "User berhasil didaftarkan"
}
```

---

### 3️⃣ Login with Credentials

1. Go to: `http://localhost:5173/login`
2. Fill form:
   - **Email:** testuser@example.com (same email)
   - **Password:** TestPass123
3. Click "Sign In"

**Check browser console (F12):**

- Should see logs like:
  ```
  [API] POST /auth/login/
  [API] Response 200
  ```
- Token should be saved in localStorage
- Should redirect to `/dashboard`

**If Login Fails:**

- Check that username matches (usually email before @)
- Verify password is correct
- Check backend error: `http://localhost:8000/api/auth/login/`

---

### 4️⃣ View Available Rooms

1. After login, go to: `http://localhost:5173/rooms`
2. Should see 7 room cards in grid view
3. Each card shows: name, location, capacity, price, amenities

**If No Rooms Show:**

- Check browser console for errors
- Verify token is in localStorage (DevTools → Application → LocalStorage)
- Test API directly: `http://localhost:8000/api/rooms/` (with Authorization header if needed)

**Debugging:**

```javascript
// Paste in browser console
fetch("http://localhost:8000/api/rooms/", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

---

### 5️⃣ Click Room to View Details

1. Click on any room card
2. Should go to: `/rooms/{id}` with room details
3. Should NOT redirect to login

**If Auto-Logout Happens:**

- Token might have expired
- Check token format in localStorage (should start with `ey...`)
- Login again and immediately click room

---

### 6️⃣ Test Filters

1. On `/rooms` page:
   - **Search:** Type room name (e.g., "Meeting")
   - **Price slider:** Adjust max price
   - **Capacity:** Select options
   - **Amenities:** Check WiFi, Projector, etc.

Rooms should filter in real-time.

---

## 🔧 Debugging Tips

### Browser Console Errors

```javascript
// Check if API is reachable
fetch("http://localhost:8000/api/rooms/")
  .then((r) => r.json())
  .then(console.log);

// Check token
console.log(localStorage.getItem("token"));

// Check auth store state
console.log(JSON.parse(localStorage.getItem("authStore")));
```

### Django Errors

Check terminal where `python manage.py runserver` is running

### Common Issues

| Issue                     | Solution                                              |
| ------------------------- | ----------------------------------------------------- |
| CORS error                | Restart backend, check CORS settings in settings.py   |
| 401 Unauthorized          | Login again, check token in localStorage              |
| Empty rooms list          | Check database has rooms (runscript populate_data.py) |
| Auto-logout on room click | Token might be invalid, re-login                      |
| "Failed to fetch rooms"   | Check backend is running, API endpoint correct        |

---

## ✅ Success Checklist

- [ ] Backend API returns rooms data
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] Rooms page shows all 7 rooms
- [ ] Can click room without logout
- [ ] Search/filter works
- [ ] Token persists in localStorage
- [ ] Can logout and login again

---

## 📲 Test Credentials (After Registration)

Email: testuser@example.com
Password: TestPass123

Or create another test account with different email.

---

## 🐛 Report Issues

If something fails:

1. Check browser console (F12)
2. Check Django terminal for errors
3. Check Network tab (F12) to see API calls
4. Verify token is valid format
5. Restart both frontend & backend
