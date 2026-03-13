# Finexus: Intelligent Wealth & Life Planning Dashboard 🚀

Finexus is a high-performance, private financial ecosystem designed for families to transition from debt management to exponential wealth creation. Built with a focus on psychological safety, predictive planning, and collaborative governance between partners.

## 🌟 The Vision
More than a simple expense tracker, Finexus is a **strategic roadmap**. It was conceived to help families (like Pedro & Izabel) navigate through financial de-leveraging while preparing for major life milestones—such as the arrival of a child.

## 🛠️ Core Features

### 1. Master Plan (2026-2027)
A multi-layered strategic view that maps the entire journey of debt liquidation (Santander) and the start of the "Snowball Effect" in real estate funds (FIIs).
- **Izabel View**: Focused on her specific income, deductions, and individual goals.
- **Tactical Comparison**: Visualizing progress against established benchmarks.

### 2. Debt Gamification & De-leveraging
Visualizing the "crushing" of debts. The dashboard transforms cold numbers into a clear path toward the "Zero Debt" milestone, providing immediate psychological relief and motivation.

### 3. Future Projection (2027+)
A dedicated module to visualize life after debt:
- **Cashflow Scaling**: Predicting the jump in free cashflow once installments end.
- **Official Investment Calendar**: A monthly roadmap for building a portfolio of Paper and Brick FIIs.

### 4. Family Rewards (Férias 2028)
An emotional goal-tracking module for "Operation: The Great Reward"—a family trip in 2028 to celebrate financial freedom. Features include destination simulations and budget mapping.

### 5. Intelligent Processing (AI Driven)
Leveraging **Google Gemini API** to process bank statements (PDFs), invoices, and images, automatically mapping transactions to the family's financial structure.

## 💻 Tech Stack
- **Frontend**: React 18 with TypeScript.
- **Styling**: Tailwind CSS (Modern, Responsive, Dark-mode first).
- **Backend/Auth**: Firebase (Authentication & Firestore for real-time sync).
- **Intelligence**: Google Generative AI (Gemini).
- **Storage**: LocalStorage & IndexedDB for persistence and offline-first capabilities.

## 🚀 Getting Started

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/finexus-dashboard.git
   ```
2. **Setup environment variables**:
   Create a `.env` file based on `.env.example` and add your `VITE_GEMINI_API_KEY`.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run development server**:
   ```bash
   npm run dev
   ```

## 🔒 Security & Privacy
Finexus is designed to be a private dashboard. All sensitive data is either stored in your private Firebase instance or handled locally.

---
*Built for family, driven by data, focused on freedom.*
