# LD Interiors & Furnitures - AI Powered Custom Showroom

LD Interiors & Furnitures is a premium web application designed for a luxury custom woodworking and carpentry workshop based in Mulasthanam, Alamuru Mandal, Andhra Pradesh. The application features a 3D glassmorphic wood-panel theme, a live design catalog, an interactive customer feedback system, order status tracking, and a conversational AI Chatbot (`LD Assistant`) speaking in warm, local Telugu-English (Tanglish).

---

## 🌟 Key Features

### 1. Modern Glassmorphic Wood Theme
* Curated dark wood color palettes, warm cream cards, and a custom wood-grain staggered plank background.
* Beautiful 3D animations, hover micro-interactions, and visual typography.

### 2. Live Design Catalog & Details View
* Filter products by space categories (Living Room, Kitchen, Bedroom, Swings, TV Units, Mesh Doors, Polish, etc.).
* View detailed descriptions, uploaded dates, pricing, and rolling average ratings.
* Order designs directly through pre-filled WhatsApp checkout messages sent to owner **Nagaraju** or admin **Pavan Sai**.

### 3. Real-Time Customer Ratings & Feedback
* Interactive star rating widget on details pages allows customers to rate carpentry designs (1-5 stars).
* Submissions automatically recalculate the rolling average score via backend mathematical formulas and update the database.

### 4. Admin Dashboard Workspace
* Manage designs: upload new woodworking models with image upload, custom description text, pricing, and initial ratings.
* Dynamic editing and deletion of design options.
* Live Customer Orders: track customer inquiries and update statuses (`Pending`, `Processing`, `In Progress`, `Completed`, `Cancelled`).

### 5. Floating AI Chatbot (`LD Assistant`)
* Speaks warm, local Telugu-English (Tanglish) representing Konaseema hospitality.
* Performs token-based semantic searches across product titles, categories, and descriptions.
* Answers questions on address, locations, wood quality (Teak wood, Rosewood), and pricing estimations.
* Live timeline tracking of customer orders based on mobile number inputs.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js (App Router), React 19, TailwindCSS, Axios, Lucide Icons.
* **Backend**: Node.js, Express, MongoDB Atlas, Mongoose.
* **Storage**: Cloudinary API (for reliable image storage and fastCDN delivery).
* **Auth**: JSON Web Tokens (JWT) for secure admin panel login.

---

## 📂 Project Structure

```
LD-Interiors-AI/
├── backend/
│   ├── config/             # Cloudinary & database connections
│   ├── controllers/        # Product, order, and auth controllers
│   ├── middleware/         # Upload parsing & auth verification
│   ├── models/             # Mongoose schemas (Product, Order, User)
│   ├── routes/             # API routes
│   ├── server.js           # Server initialization
│   └── verify_connection.js# Atlas integration test script
├── frontend/
│   ├── public/             # Static assets and images
│   ├── src/
│   │   ├── app/            # App router page structures (admin, gallery, details)
│   │   ├── components/     # Chatbot, cards, navbar, and footer
│   │   └── utils/          # API Axios helpers
└── README.md
```

---

## 🚀 Getting Started

### 📋 Prerequisites
* Node.js (v18+ recommended)
* MongoDB Atlas Cluster database URI
* Cloudinary credentials

### 🔧 Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tpavans/LD-Interiors-AI.git
   cd LD-Interiors-AI
   ```

2. **Configure Backend Environment**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5004
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ADMIN1_EMAIL=admin@ldinteriors.com
   ADMIN1_PASSWORD=your_secure_password
   ```

3. **Configure Frontend Environment**:
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5004/api
   ```

4. **Install Dependencies & Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Install Dependencies & Start Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

6. **Access App**:
   * Frontend website: `http://localhost:3000`
   * Admin dashboard: `http://localhost:3000/admin`

---

## 🤝 Authors & Credits
* **Project Constructor / Carpenter Head**: Nagaraju (+916281653998)
* **Website Developer & Tech Admin**: Pavan Sai (+919346325291)
