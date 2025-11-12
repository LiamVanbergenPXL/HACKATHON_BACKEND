# FishTracker Backend - Student Startup Guide

Welcome to the FishTracker Backend hackathon! This guide will help you get up and running quickly so you can focus on building your mobile app integration.


## 📋 Prerequisites

Before you start, make sure you have installed:

1. **Bun** - JavaScript runtime
   ```bash
   # Install Bun (if not already installed)
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Docker Desktop** - For running MongoDB locally
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running before starting MongoDB

3. **Git** - For cloning the repository (if needed)

4. **Code Editor** - VS Code, Cursor, or your preferred editor

5. **API Testing Tool** (optional but recommended):
   - Postman: https://www.postman.com/downloads/
   - Or use `curl` from terminal
   - Or use the Swagger UI at `http://localhost:3000/api/swagger/ui`

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Navigate to the project directory
cd HACKATHON_BE

# Install all dependencies
bun install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example (if provided) or create new
touch .env
```

Add these variables to your `.env` file:

```env
# Server Configuration
PORT=3000

# MongoDB Connection (local Docker)
MONGO=mongodb://localhost:27017

# OpenAI API (for fish identification and chat)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: If you want to use local file storage instead of Azure
STORAGE_TYPE=local
STORAGE_PATH=./uploads
```

**Important**: You'll need an OpenAI API key. Get one at: https://platform.openai.com/api-keys

### Step 3: Start MongoDB with Docker

```bash
# Start MongoDB container
docker run -d --name mongodb-fishtracker -p 27017:27017 -e MONGO_INITDB_DATABASE=fishDB mongo:latest

# Verify it's running
docker ps
```

If you need to stop MongoDB later:
```bash
docker stop mongodb-fishtracker
```

If you need to remove the container:
```bash
docker rm mongodb-fishtracker
```

### Step 4: Start the API Server

```bash
# Run in development mode (with hot reload)
bun run dev
```

You should see:
```
Connected to mongodb on: mongodb://localhost:27017
Server running on port 3000
```

### Step 5: Verify It's Working

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

Visit the Swagger UI to explore all endpoints:
```
http://localhost:3000/api/swagger/ui
```

## 📡 API Endpoints Overview

### Device Management

#### Register a Device
```http
POST /api/device/register
Content-Type: application/json

{
  "deviceId": "my-device-123"
}
```

#### Get Device Info
```http
GET /api/device/:deviceId
```

### Fish Operations

#### Upload Fish Image
```http
POST /api/fish/upload
Content-Type: multipart/form-data

deviceId: "my-device-123"
file: [image file]
```

**Response:**
```json
{
  "success": true,
  "message": "File validated and put into message queue.",
  "deviceId": "my-device-123",
  "fileMeta": {
    "originalName": "fish.jpg",
    "mimeType": "image/jpeg",
    "size": 245678
  },
  "fish": {
    "fishDetected": true,
    "data": [...]
  }
}
```

#### Get All Fish for a Device
```http
GET /api/fish/:deviceId
```

#### Get Fish Image
```http
GET /api/fish/image/:imagePath
```

### Chat with AI

#### Ask Questions About Detected Fish
```http
POST /api/chat/:deviceId
Content-Type: application/json

{
  "message": "What types of fish have I seen?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed chat request",
  "data": {
    "response": "Based on your device's detections, you've seen 3 types of fish..."
  }
}
```

## 🧪 Testing the API

### Using curl

```bash
# 1. Register a device
curl -X POST http://localhost:3000/api/device/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device-1"}'

# 2. Upload an image (replace with actual image path)
curl -X POST http://localhost:3000/api/fish/upload \
  -F "deviceId=test-device-1" \
  -F "file=@/path/to/fish-image.jpg"

# 3. Get fish for device
curl http://localhost:3000/api/fish/test-device-1

# 4. Chat about fish
curl -X POST http://localhost:3000/api/chat/test-device-1 \
  -H "Content-Type: application/json" \
  -d '{"message": "What fish have I detected?"}'
```

### Using Postman

1. Import the Swagger spec from: `http://localhost:3000/api/swagger/doc`
2. Or manually create requests using the endpoints above

## 📱 Connecting Your Mobile App

### Important: Network Configuration

Since you're at a remote location and need to connect your mobile app:

1. **Find your computer's IP address:**
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows
   ipconfig
   ```

2. **Make sure your mobile device is on the same network** (same WiFi)

3. **Update your mobile app's API base URL:**
   ```
   http://YOUR_IP_ADDRESS:3000/api
   ```
   Example: `http://192.168.1.100:3000/api`

4. **Allow incoming connections** (if firewall prompts, allow it)

5. **Test connectivity from your phone:**
   - Open browser on phone
   - Go to: `http://YOUR_IP_ADDRESS:3000/api/health`
   - Should see: `{"status":"ok"}`

### CORS Configuration

The API should already be configured to accept requests from mobile apps. If you encounter CORS errors, check the middleware configuration.

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if Docker is running
docker ps

# Check if MongoDB container is running
docker ps | grep mongodb

# If not running, start it:
docker start mongodb-fishtracker

# Or create a new one:
docker run -d --name mongodb-fishtracker -p 27017:27017 mongo:latest
```

### Issue: "OpenAI API key not configured"

**Solution:**
- Make sure you have `OPENAI_API_KEY` in your `.env` file
- Get an API key from: https://platform.openai.com/api-keys
- Restart the server after adding the key

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Option 1: Use a different port
# In .env file, change: PORT=3001

# Option 2: Kill the process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Cannot connect from mobile app"

**Solution:**
1. Make sure both devices are on the same WiFi network
2. Check your computer's firewall settings
3. Verify the IP address is correct
4. Try accessing the health endpoint from your phone's browser first
5. Make sure the server is running with `bun run dev`

### Issue: "Image upload fails"

**Solution:**
- Check that the file is actually an image (jpg, png, etc.)
- Verify the `deviceId` exists (register device first)
- Check server logs for detailed error messages
- Make sure `STORAGE_PATH` directory exists if using local storage

### Issue: "Fish detection returns empty"

**Solution:**
- The image might not contain fish
- Try with a clear fish image
- Check that OpenAI API key is valid
- Review server logs for API errors

## 📚 Understanding the Codebase Structure

```
src/
├── index.tsx              # Main server entry point
├── db/
│   ├── index.ts          # MongoDB connection
│   └── models.ts         # Database schemas (Device, Fish, etc.)
├── routes/
│   ├── device.route.ts   # Device endpoints
│   ├── fish.route.ts     # Fish endpoints
│   └── chat.route.ts     # Chat endpoints
├── services/
│   ├── device.service.ts # Device business logic
│   ├── fish.service.ts   # Fish business logic
│   └── chat.service.ts   # Chat/AI logic
├── lib/
│   ├── fishDetection.ts  # Image detection logic
│   └── ...               # Utility functions
└── middleware/
    └── index.ts          # Request logging, etc.
```

## 🎯 What You Need to Build (Mobile App)

Your mobile app should:

1. **Register a device** when the app starts
2. **Upload fish images** from camera or gallery
3. **Display detected fish** in a list/grid
4. **Show fish details** (name, description, etc.)
5. **Display fish images** from the API
6. **Chat with AI** about detected fish

### Suggested Mobile App Flow

```
App Start
  ↓
Register Device (if not exists)
  ↓
Main Screen
  ├─ Camera Button → Take Photo → Upload
  ├─ Gallery Button → Select Photo → Upload
  └─ Fish List → Show Detected Fish
       ↓
    Fish Detail Screen
       ├─ Fish Image
       ├─ Fish Info
       └─ Chat Button
            ↓
         Chat Screen → Ask Questions
```

## 🔍 Debugging Tips

1. **Check server logs** - All requests are logged to console
2. **Use Swagger UI** - Test endpoints directly: `http://localhost:3000/api/swagger/ui`
3. **Check MongoDB** - Connect with MongoDB Compass: `mongodb://localhost:27017`
4. **Network inspection** - Use browser dev tools or network monitoring apps
5. **Test endpoints individually** - Use curl or Postman before integrating

## 📝 API Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

Always check the `success` field before accessing `data`.

## ⚡ Performance Tips

1. **Image size**: Compress images before uploading (mobile apps should resize)
2. **Caching**: Fish images are cached for 1 hour
3. **Rate limiting**: Same fish detected within 10 seconds is skipped (prevents spam)
4. **Async processing**: Image processing happens asynchronously

## 🆘 Getting Help

If you're stuck:

1. **Check the logs** - Server console shows detailed error messages
2. **Review this guide** - Most common issues are covered
3. **Test with Swagger UI** - Verify endpoints work before mobile integration
4. **Ask your instructors** - They're there to help!

## ✅ Pre-Hackathon Checklist

Before the hackathon starts, make sure you can:

- [ ] Install Bun and Docker
- [ ] Start MongoDB container
- [ ] Get OpenAI API key
- [ ] Start the server successfully
- [ ] Access Swagger UI
- [ ] Register a device via API
- [ ] Upload a test image
- [ ] Access the API from your phone's browser

## 🎉 Good Luck!

You have everything you need to get started. Focus on building a great mobile app experience, and don't forget to test early and often!

Remember: The backend is already set up for you. Your job is to build an amazing mobile frontend that uses these APIs effectively.

