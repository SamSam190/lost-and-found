# Lost & Found Item Management System

## Prerequisites
- Node.js installed
- MongoDB installed locally (or a MongoDB Atlas URI)
- Git installed

## 1. Local Setup
1. **Database:** Ensure MongoDB is running. If using Atlas, replace the `MONGO_URI` in `backend/.env` with your connection string.
2. **Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Server will run on http://localhost:5000.
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm install axios react-router-dom bootstrap react-bootstrap // If not installed
   npm run dev
   ```
   App will run on the Vite localhost port (usually 5173).

## 2. GitHub Deployment
1. Go to the root `MSE2_AIFSD` folder.
2. Initialize Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Create a new repository on GitHub.
4. Copy the remote URL and add it:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

## 3. Render Deployment
1. Go to Render.com and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service:
   - **Root Directory:** `backend` (Wait, since we serve frontend from backend, the root directory should be empty or `backend` if we build frontend first. A better approach is to change Build Command in Render.)
   - **Build Command:** `cd ../frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `node index.js`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `MONGO_URI`: `<Your MongoDB Atlas URL>`
     - `JWT_SECRET`: `<SuperSecretKey>`
4. Click **Deploy Web Service**.

Once deployed, copy the Render URL and update your Markdown report. Convert the Markdown to PDF using VSCode extensions or online converters.
