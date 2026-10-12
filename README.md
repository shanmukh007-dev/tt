# AutoPulse VSM — Vehicle Service Management System

A full-stack, enterprise-grade vehicle service management application built with **Java (Spring Boot)**, **Supabase (PostgreSQL)**, **React.js**, and tested with **Postman**.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **Java 17+ / Spring Boot 3.3.4** | RESTful API, Spring Data JPA, Hibernate, JJWT (JWT Session Auth) |
| **Database** | **Supabase (PostgreSQL)** | Managed cloud PostgreSQL database with relational keys & cascading deletes |
| **Frontend** | **React.js 19 + TypeScript + Vite** | Single-page application, Tailwind CSS, Lucide Icons, TanStack Query |
| **API Testing** | **Postman Collection (v2.1.0)** | Complete suite of test requests with auto-extracted variables and tests |

---

## 🔑 Demo Accounts

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Staff Demo** | Rajesh Sharma | `staff@autovsm.com` | `password123` | Full workshop management (Dashboard, Customers, Vehicles, Services) |
| **Customer Demo** | Priya Sharma | `customer@autovsm.com` | `password123` | Customer self-service portal (Vehicle registry & service logs) |

---

## 📁 Project Structure

```text
tt/
├── backend-spring/                   # Java Spring Boot Backend
│   ├── pom.xml                       # Maven build configuration (PostgreSQL & Spring Boot)
│   ├── src/main/
│   │   ├── java/com/autopulse/vsm/
│   │   │   ├── VsmApplication.java   # Spring Boot Main Entrypoint
│   │   │   ├── config/               # CORS, WebMvc, JWT Interceptor
│   │   │   ├── controller/           # REST Controllers (Auth, Customers, Vehicles, Services, Portal)
│   │   │   ├── dto/                  # Request / Response records
│   │   │   ├── model/                # JPA Entities (User, Customer, Vehicle, ServiceRecord)
│   │   │   ├── repository/           # Spring Data JPA Repositories
│   │   │   ├── service/              # Business logic services
│   │   │   ├── util/                 # JwtUtil, SecurityUtils
│   │   │   └── initializer/          # Automatic database seeder
│   │   └── resources/
│   │       ├── application.properties    # Supabase (PostgreSQL) Configuration (Default)
│   │       ├── application-h2.properties # In-memory H2 fallback profile
│   │       └── seed_data.json            # Preloaded data for initial bootstrap
│
├── frontend/                         # React.js Frontend
│   ├── index.html                    # Single Page Application HTML
│   ├── vite.config.ts                # Vite proxy (routes /api -> Spring Boot on :8080)
│   ├── package.json                  # React 19, Tailwind, Lucide, TanStack dependencies
│   └── src/
│       ├── App.tsx                   # Declarative routing & guards
│       ├── pages/                    # Login, Dashboard, Services, Vehicles, Customers, CustomerPortal
│       ├── components/               # Modals, Dialogs, Badges, Tables, AppShell
│       └── lib/                      # API client, session management, types
│
├── supabase_schema.sql               # Ready-to-run PostgreSQL schema DDL & seed data for Supabase
├── AutoPulse_VSM.postman_collection.json # Ready-to-import Postman Collection
├── database.sql                      # MySQL schema DDL (legacy fallback)
├── Dockerfile                        # Multi-stage production container build
├── render.yaml                       # 1-Click deployment config for Render.com
├── publish-live-link.bat             # 1-Click launcher to generate instant public link
├── start-backend.bat                 # 1-Click launcher for Spring Boot backend
├── start-backend-h2.bat              # 1-Click launcher with zero-setup H2 profile
├── start-frontend.bat                # 1-Click launcher for React.js frontend
└── README.md
```

---

## 🚀 Step-by-Step Setup & Execution

### 1. Database Setup (Supabase)

1. Create a free account & new project at **[supabase.com](https://supabase.com)**.
2. In your Supabase Dashboard, go to **Project Settings** -> **Database**.
3. Under **Connection string**, select **JDBC**.
4. Set the environment variable in your terminal before launching the backend:
   ```powershell
   $env:SPRING_DATASOURCE_URL="jdbc:postgresql://db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   $env:SPRING_DATASOURCE_USERNAME="postgres"
   $env:SPRING_DATASOURCE_PASSWORD="[YOUR-SUPABASE-PASSWORD]"
   ```
   *(Or copy `.env.example` to `.env` and fill in your values).*
5. *(Optional)* If you want to view or run the table DDL manually, paste [`supabase_schema.sql`](file:///c:/Users/rajch/OneDrive/Desktop/tt/supabase_schema.sql) into **Supabase Dashboard -> SQL Editor** and click **Run**. Hibernate also auto-generates tables and seeds records on startup!

---

### 2. Run the Java Spring Boot Backend

#### Option A: Using the Windows Batch script
Double-click [`start-backend.bat`](file:///c:/Users/rajch/OneDrive/Desktop/tt/start-backend.bat)

#### Option B: Using Maven in terminal
```powershell
cd backend-spring
mvn spring-boot:run
```
*(Runs at **http://localhost:8080**)*

> **Tip (Zero-setup H2 mode)**: If you want to test immediately without configuring MySQL credentials, run:
> ```powershell
> cd backend-spring
> mvn spring-boot:run "-Dspring-boot.run.profiles=h2"
> ```
> Or double-click [`start-backend-h2.bat`](file:///c:/Users/rajch/OneDrive/Desktop/tt/start-backend-h2.bat).

---

### 3. Run the React.js Frontend

#### Option A: Using the Windows Batch script
Double-click [`start-frontend.bat`](file:///c:/Users/rajch/OneDrive/Desktop/tt/start-frontend.bat)

#### Option B: Using npm in terminal
```powershell
cd frontend
npm install
npm run dev
```
*(Runs at **http://localhost:3000**)*

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📮 Testing with Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Select or drag-and-drop [`AutoPulse_VSM.postman_collection.json`](file:///c:/Users/rajch/OneDrive/Desktop/tt/AutoPulse_VSM.postman_collection.json).
4. The collection includes 15 ready-to-run REST API requests organized by folder:
   - **Authentication**: Staff login, Customer login, Current user (`/me`), Logout.
   - **Customers**: List, Create, Update, Delete customer records.
   - **Vehicles**: List, Create, Update, Delete vehicle records.
   - **Services**: List, Create, Update status, Delete service logs.
   - **Customer Portal**: Get customer summary with linked vehicles & service histories.
   - **Root & Health**: `GET /api` health check.
5. Hit **Send** on **"1. Login (Staff Demo)"** — authentication cookies and headers are handled automatically!

---

## 🌐 Publishing & Sharing Live Link

### Option 1: Instant Public Link (No Cloud Signup Required)
Double-click [`publish-live-link.bat`](file:///c:/Users/rajch/OneDrive/Desktop/tt/publish-live-link.bat).
- It boots the unified Spring Boot app and tunnels port `8080` to a secure public `https://...` URL.
- Copy and share the URL — anyone can open it in their browser and access the full live website.

### Option 2: 1-Click Cloud Deployment (Render.com)
1. Push this folder to a GitHub repository.
2. Go to [Render.com](https://render.com) and click **New + Web Service**.
3. Select your repository. Render will automatically detect [`render.yaml`](file:///c:/Users/rajch/OneDrive/Desktop/tt/render.yaml) or [`Dockerfile`](file:///c:/Users/rajch/OneDrive/Desktop/tt/Dockerfile).
4. Click **Deploy** — your site will be live at `https://autopulse-vsm.onrender.com`.
