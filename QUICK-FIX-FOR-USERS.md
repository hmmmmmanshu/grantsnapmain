# 🔧 Quick Fix: If You See "TypeError: t is not a function"

## What Happened?
You're seeing an error because there's old cached data in your browser. Don't worry - this is easy to fix!

---

## ⚡ Quick Fix (Choose One)

### Option 1: Clear Browser Cache (Recommended)
**Takes 30 seconds**

#### Chrome / Edge
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Check these boxes:
   - ✅ Cookies and site data
   - ✅ Cached images and files
3. Click "Clear data"
4. Reload the page

#### Firefox
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Everything" in the time range
3. Check these boxes:
   - ✅ Cookies
   - ✅ Cache
4. Click "Clear Now"
5. Reload the page

#### Safari
1. Go to Safari → Settings → Privacy
2. Click "Manage Website Data..."
3. Find `grantsnap.pro`
4. Click "Remove" then "Done"
5. Reload the page

---

### Option 2: Hard Refresh (Fastest)
**Takes 2 seconds**

Just press:
- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

This forces your browser to load the latest version from the server.

---

### Option 3: Console Command (For Tech Users)
**Takes 5 seconds**

1. Press `F12` to open DevTools
2. Click the **Console** tab
3. Paste this command and press Enter:
   ```javascript
   localStorage.clear(); location.reload();
   ```

---

## ✅ How to Know It's Fixed

After clearing cache and reloading:

1. You should **NOT** see the error screen
2. The dashboard should load normally
3. You can click "Profile Hub" without crashes
4. AI Context features work smoothly

---

## 🎯 Why This Happened

We recently upgraded the AI Context feature to work better. Your browser had old data cached from before the upgrade. Clearing the cache removes the old data, and the site will work perfectly with the new version!

---

## 📞 Still Having Issues?

If you've tried all the above and still see errors:

1. **Try a different browser** - Use Chrome, Firefox, or Edge
2. **Try Incognito/Private mode** - This uses a fresh cache
3. **Contact Support** - We're here to help!
   - Email: support@grantsnap.pro
   - Include: What you tried + screenshot of error

---

## 💡 Pro Tip

After clearing cache once, you won't need to do it again. The fix is permanent for your browser!

---

**Updated**: October 24, 2025  
**Status**: ✅ Fix is live in production


