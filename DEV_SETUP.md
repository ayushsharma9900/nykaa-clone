# Development Setup Guide

This guide explains how to run the Nykaa Clone application with proper port configuration.

## Port Configuration

- **Frontend (Next.js)**: `http://localhost:3000`
- **Backend (Express)**: `http://localhost:5001`

## Environment Files

### Frontend (.env.local)
The frontend environment variables are configured in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_NAME=Nykaa Clone
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
The backend environment variables are in `backend/.env`:
```env
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/nykaa-clone
```

## Running the Application

### Option 1: Run Everything Together (Recommended)
```bash
# Install dependencies for both frontend and backend
npm install
cd backend && npm install && cd ..

# Install concurrently if not already installed
npm install

# Run both frontend and backend simultaneously
npm run dev:full
```

### Option 2: Run Separately
```bash
# Terminal 1: Start the backend
cd backend
npm run dev

# Terminal 2: Start the frontend (in project root)
npm run dev
```

### Option 3: Individual Commands
```bash
# Frontend only (port 3000)
npm run dev

# Backend only (port 5001)
npm run backend
# or
cd backend && npm start
```

## Database Setup

1. **Install MongoDB**: Make sure MongoDB is installed and running locally
2. **Database URL**: The app connects to `mongodb://localhost:27017/nykaa-clone`
3. **Seed Data**: Run the seed script to populate initial data:
   ```bash
   cd backend
   npm run seed
   ```

## Verifying Setup

1. **Backend Health Check**: Visit `http://localhost:5001/api/health`
2. **Frontend**: Visit `http://localhost:3000`
3. **API Connection**: The frontend should automatically connect to the backend API

## Port Conflicts Resolution

If you encounter port conflicts:

1. **Change Frontend Port**:
   - Update `package.json` script: `"dev": "next dev --turbopack -p 3001"`
   - Update `.env.local`: `NEXTAUTH_URL=http://localhost:3001`
   - Update backend `FRONTEND_URL` in `backend/.env`

2. **Change Backend Port**:
   - Update `backend/.env`: `PORT=5002`
   - Update `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5002/api`

## Troubleshooting

### Common Issues

1. **"EADDRINUSE" Error**: Port is already in use
   - Kill the process using the port: `npx kill-port 3000` or `npx kill-port 5001`
   - Or change the port as described above

2. **API Connection Failed**: 
   - Ensure backend is running on the correct port
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify CORS settings in `backend/server.js`

3. **Database Connection Error**:
   - Make sure MongoDB is running
   - Check the `MONGODB_URI` in `backend/.env`

### Useful Commands

```bash
# Check what's running on specific ports
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# Kill processes on specific ports (Windows)
npx kill-port 3000
npx kill-port 5001

# Check MongoDB status (if installed as service)
net start MongoDB

# View backend logs
cd backend && npm run dev

# View all running Node processes
tasklist | findstr node
```

## Next Steps

Once the application is running:
1. Create an admin user through the backend API
2. Access the admin panel at `http://localhost:3000/admin`
3. Use the new admin endpoints documented in `backend/ADMIN_API_FIXES.md`
