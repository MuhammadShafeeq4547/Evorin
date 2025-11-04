# Quick Start Guide - Instagram Clone

Get up and running in 5 minutes!

## Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Git

## Step 1: Clone & Install (2 min)

```bash
# Clone repository
git clone <repo-url>
cd instgram

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

## Step 2: Configure Environment (2 min)

### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` - minimum required:
```env
MONGODB_URI=mongodb://localhost:27017/instagram_clone
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Frontend (.env)
```bash
cd ../frontend
cp .env.example .env
# Default is already correct: VITE_API_URL=http://localhost:5000
```

## Step 3: Start Servers (1 min)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Wait for: `🚀 Instagram Clone Server Running`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

## Step 4: Test Application (1 min)

1. Open http://localhost:5173 in browser
2. Click "Register"
3. Fill in form and submit
4. Check console for verification link (or email if configured)
5. Login with credentials
6. Create a post!

## Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Fix:** Start MongoDB or use MongoDB Atlas connection string

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Fix:** Change PORT in `.env` or kill process: `lsof -ti:5000 | xargs kill -9`

### Email Not Sending
```
Error: Invalid login
```
**Fix:** Use Gmail App Password (not regular password)

### API Connection Error
```
Error: Network Error
```
**Fix:** Ensure backend is running on port 5000

## Next Steps

- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration
- Check [AUDIT_REPORT.md](./AUDIT_REPORT.md) for known issues
- Review [CHANGELOG.md](./CHANGELOG.md) for recent fixes

## Features to Try

✅ Register & Login
✅ Create Posts with Images
✅ Like & Comment
✅ Follow Users
✅ Send Messages (Real-time)
✅ Dark Mode
✅ Responsive Design

## API Health Check

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) Troubleshooting section
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set

---

**Ready to code?** Start with `npm run dev` in both directories!
