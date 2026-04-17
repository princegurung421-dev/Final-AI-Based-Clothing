# 🚀 How to Run WearWise Locally

Follow these step-by-step instructions to get the WearWise platform running perfectly on your machine.

---

### Step 1: Set Up Your `.env` File
Ensure you have created a `.env` file in the root directory (where your `package.json` is). It must contain your API keys and configuration.

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/wearwise?schema=public"

# NextAuth Configuration (generates sessions securely)
AUTH_SECRET="any_random_string_here_or_generate_with_openssl"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Gemini AI (For the style assistant)
GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_studio_api_key_here"

# OpenWeatherMap (For real weather-aware styling suggestions)
OPENWEATHERMAP_API_KEY="your_openweathermap_api_key_here"

# Cloudinary (For Wardrobe Uploads - frontend only)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"

# Stripe (Checkout Simulation)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

---

### Step 2: Configure Cloudinary (For Wardrobe Uploads)
Since the app uploads directly from the user's browser, you need to open a secure pathway in your Cloudinary account.
1. Log into Cloudinary > **Settings** (Gear Icon) > **Upload**.
2. Scroll to **Upload Presets** and click **Add upload preset**.
3. Name it exactly **`wearwise_unsigned`**.
4. Set the **Signing Mode** to **Unsigned**.
5. Save the preset.

---

### Step 3: Initialize the Database
The application uses PostgreSQL with Prisma. You need to map our database models (Users, Products, Orders, etc.) into your actual database.
Run this command in your terminal:
```bash
npx prisma db push
```
*(This forces your database to match the Prisma schema without needing shadow database permissions).*

---

### Step 4: Seed the Mock Data
To populate the store so it's not empty, we wrote a seeding script that will inject beautiful, realistic fashion products into your database, as well as an Admin account.
Run exactly:
```bash
npm run seed
```

---

### Step 5: Start the Development Server
You are all set! Boot up the Next.js frontend:
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser. 
*(You can log in to the admin panel or store using the admin account generated from the mock data during Step 4, or just create a brand new user account directly on the website).*

Enjoy building and testing wearwise!
