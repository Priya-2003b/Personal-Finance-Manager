# Personal Finance Manager

A modern full-stack personal finance management application that helps users track income, expenses, budgets, savings goals, and financial insights with beautiful analytics dashboards and smart visualizations.

Built using:

* **Node.js + Express.js** backend
* **MongoDB + Mongoose** database
* **React.js** frontend
* **JWT Authentication**
* **Bootstrap + Custom Theme CSS**
* **Recharts Analytics**
* **Docker Support**

---

# Table of Contents

1. Features
2. Tech Stack
3. Project Structure
4. Installation
5. Environment Variables
6. Usage
7. Dashboard Features
8. Docker Deployment
9. License

---

# Features

## Authentication & Security

* JWT-based authentication
* Secure login & registration
* Protected frontend routes
* Protected backend APIs
* Password hashing using bcrypt
* AuthContext for global authentication state

---

## Dashboard Analytics

* Total Income card
* Total Expense card
* Current Balance card
* Monthly Budget tracking
* Savings percentage analytics
* Animated dashboard counters using CountUp

---

## Smart Financial Insights

AI-like smart financial analysis including:

* Highest spending category detection
* Savings habit analysis
* Budget exceeded warnings
* Monthly expense trend detection
* Spending personality insights
* Sudden expense spike detection

---

## Budget Management

* Set monthly budget
* Real-time budget usage progress bar
* Budget exceeded alerts
* Expense tracking against budget

---

## Saving Goals Tracker

* Create savings goals
* Goal progress tracking
* Goal completion percentage
* Progress bars with analytics
* Scrollable goals section for clean UI

Examples:

* Trip goals
* Laptop savings
* Emergency fund
* Vehicle savings

---

## Transaction Management

* Add transactions
* Edit transactions
* Delete transactions
* Income & expense support
* Transaction descriptions
* Date-wise records
* Recent transactions panel

---

## Advanced Categories System

* Custom categories
* Parent & subcategories
* Category budgets
* Expense categorization
* Auto category analytics

---

## Financial Charts & Analytics

Interactive analytics using Recharts:

### Pie Chart

* Expense breakdown by category

### Line Chart

* Income vs Expense trends

### Bar Chart

* Monthly expenses analytics

### Stacked Category Bar Chart

* Parent & subcategory spending comparison

---

## Reports & Export

* Download dashboard as PDF
* Financial report generation
* Dashboard screenshot export using html2canvas + jsPDF

---

## UI & Theme System

* Fully responsive dashboard
* Dark mode inspired modern UI
* Custom `theme.css`
* Card-based dashboard layout
* Scrollable analytics panels
* Optimized spacing and alignment
* Mobile responsive design

---

## User Experience Features

* Loading spinners
* Empty-state UI
* Error handling
* Alerts & warnings
* Smooth animations
* Interactive dashboard

---

# Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt
* express-validator

---

## Frontend

* React.js
* React Router DOM
* Axios
* Bootstrap
* Recharts
* CountUp
* html2canvas
* jsPDF

---

# Project Structure

```plaintext
Personal-Finance-Manager/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   │   ├── users.js
│   │   │   ├── transactions.js
│   │   │   └── categories.js
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── transactionController.js
│   │   │   └── categoryController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   └── Category.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validate.js
│   │   └── validators/
│   │       ├── userValidator.js
│   │       ├── transactionValidator.js
│   │       └── categoryValidator.js
│   ├── package.json
│   └── Dockerfile

├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── CategoryList.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AuthForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile

├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/m-ah07/Personal-Finance-Manager.git
```

---

## 2. Install Backend Dependencies

```bash
cd Personal-Finance-Manager/backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

# Environment Variables

## Backend `.env`

Create `.env` inside backend folder:

```env
DB_URI=mongodb://127.0.0.1:27017/personal_finance
JWT_SECRET=your_secret_key
PORT=5000
```

---

## Frontend `.env`

Create `.env` inside frontend folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

# Usage

## Start Backend

```bash
cd backend
npm run dev
```

Backend runs on:

```plaintext
http://localhost:5000
```

---

## Start Frontend

```bash
cd frontend
npm start
```

Frontend runs on:

```plaintext
http://localhost:3000
```

---

# Dashboard Features

## Main Dashboard Includes

* Financial summary cards
* Budget tracking
* Smart insights panel
* Saving goals section
* Expense analytics
* Monthly reports
* Category breakdown
* Income vs expense trends
* Recent transaction history

---

# Docker Deployment

Run entire application using Docker:

```bash
docker-compose up --build
```

Services:

* Frontend → `http://localhost:3000`
* Backend → `http://localhost:5000`
* MongoDB → `mongodb://localhost:27017`

---

# License

This project is licensed under the MIT License.

Feel free to modify, improve, and use it for learning or production purposes.

---

# Future Improvements

* AI expense prediction
* Heatmap spending calendar
* Notification system
* Email reports
* OCR bill scanning
* Voice-based expense entry
* Multi-currency support
* Recurring transactions
* Net worth tracking
* Gamification badges

---

**Happy Budgeting & Smart Financial Tracking 💰📊**
