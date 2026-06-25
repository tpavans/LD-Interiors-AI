# Deployment Guide - LD Interiors & Furnitures

This guide explains how to deploy the **LD Interiors & Furnitures** application to production. Since the application is split into a Next.js frontend and a Node.js Express backend, we will deploy them separately to get the best performance and free hosting tiers.

---

## 🗺️ Deployment Overview
* **Backend API**: Deployed on [Render](https://render.com/) or [Railway](https://railway.app/).
* **Frontend Client**: Deployed on [Vercel](https://vercel.com/) (the creators of Next.js).
* **Database**: Hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
* **Image Hosting**: Hosted on [Cloudinary](https://cloudinary.com/).

---

## 🗄️ Step 1: Database Whitelisting (MongoDB Atlas)
Before deploying, make sure your MongoDB Atlas cluster allows incoming connections from your hosting providers:
1. Log into **MongoDB Atlas**.
2. Go to **Network Access** under the Security section in the left sidebar.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (IP address `0.0.0.0/0`).
5. Click **Confirm**. 
   > [!IMPORTANT]
   > Since hosting providers like Vercel and Render use dynamic IP addresses, this setting is required so your backend can connect to the database.

---

## 🚀 Step 2: Backend Deployment (Render)
We will deploy the Node.js Express backend to **Render.com** (which offers a free tier for web services).

1. Sign up/Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository `LD-Interiors-AI`.
4. Configure the Web Service settings:
   * **Name**: `ld-interiors-backend` (or any name you prefer)
   * **Environment**: `Node`
   * **Region**: Choose the closest region to your target users (e.g., Singapore/Oregon)
   * **Branch**: `main`
   * **Root Directory**: `backend` (very important: set this to the backend folder)
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Scroll down and click **Advanced** to add **Environment Variables**:
   * `PORT`: `10000` (or leave empty, Render assigns this automatically)
   * `MONGO_URI`: `mongodb+srv://...` (your Atlas URI)
   * `JWT_SECRET`: `your_random_secret_string`
   * `NODE_ENV`: `production`
   * `CLOUDINARY_CLOUD_NAME`: `your_cloudinary_cloud_name`
   * `CLOUDINARY_API_KEY`: `your_cloudinary_api_key`
   * `CLOUDINARY_API_SECRET`: `your_cloudinary_api_secret`
   * `ADMIN1_EMAIL`: `admin@ldinteriors.com`
   * `ADMIN1_PASSWORD`: `your_secure_password`
6. Click **Create Web Service**.
7. Render will build and deploy your API. Once completed, copy your live API URL (e.g., `https://ld-interiors-backend.onrender.com`).

---

## 💻 Step 3: Frontend Deployment (Vercel)
We will deploy the Next.js frontend to **Vercel** (which is optimized for Next.js builds).

1. Sign up/Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository `LD-Interiors-AI`.
4. In the Project configuration screen:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: Click *Edit* and select the **`frontend`** directory.
5. Expand the **Environment Variables** section and add:
   * **Key**: `NEXT_PUBLIC_API_URL`
   * **Value**: Your live Render API URL with `/api` appended (e.g., `https://ld-interiors-backend.onrender.com/api`)
6. Click **Deploy**.
7. Vercel will compile the Next.js build. Once completed, you will receive a public URL (e.g., `https://ld-interiors-ai.vercel.app`).

---

## 🔗 Step 4: Configure CORS on Backend (Optional check)
If you face any issues with the frontend communicating with the backend due to CORS (Cross-Origin Resource Sharing):
* The backend currently allows incoming requests automatically, but if you want to lock it down for security in production, you can restrict CORS origins in `backend/server.js` to only allow your Vercel URL.
