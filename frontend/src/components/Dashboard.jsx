import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
import CountUp from 'react-countup';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const Dashboard = () => {
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [trendData, setTrendData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categoryBarData, setCategoryBarData] = useState([]);
  const [goals, setGoals] = useState(() => {

  try {

    const savedGoals =
      localStorage.getItem("goals");

    return savedGoals
      ? JSON.parse(savedGoals)
      : [];

  } catch {

    return [];

  }

});
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  
  const COLORS = [
  '#22c55e', // green
  '#ef4444', // red
  '#3b82f6', // blue
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#14b8a6'
];

  const getCategoryChartData = (
  categoriesData,
  transactionsData
) => {

  // ONLY MAIN PARENT CATEGORIES
  const parentCategories = categoriesData.filter(
    c =>
      c.parentId === null ||
      c.parentId === undefined
  );

  return parentCategories.map(parent => {

    // FIND SUBCATEGORIES
    const subs = categoriesData.filter(
      c =>
        c.parentId &&
        (
          String(c.parentId) === String(parent._id) ||
          String(c.parentId?._id) === String(parent._id)
        )
    );

    let total = 0;

    const subData = {};

    // HANDLE SUBCATEGORIES
    subs.forEach(sub => {

      const amount = transactionsData
        .filter(
          t =>
            t.type === "expense" &&
            (
              String(t.categoryId?._id) === String(sub._id) ||
              String(t.categoryId) === String(sub._id)
            )
        )
        .reduce(
          (sum, t) =>
            sum + Number(t.amount),
          0
        );

      subData[sub.name] = amount;

      total += amount;
    });

    // HANDLE PARENT CATEGORY WITHOUT SUBS
    if (subs.length === 0) {

      const amount = transactionsData
        .filter(
          t =>
            t.type === "expense" &&
            (
              String(t.categoryId?._id) === String(parent._id) ||
              String(t.categoryId) === String(parent._id)
            )
        )
        .reduce(
          (sum, t) =>
            sum + Number(t.amount),
          0
        );

      subData[parent.name] = amount;

      total += amount;
    }

    return {
      name: parent.name,
      ...subData,
      total
    };

  });
};

const getCategorySpending = (categoryId) => {

  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        (
          String(t.categoryId?._id) === String(categoryId) ||
          String(t.categoryId) === String(categoryId)
        )
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0
    );
};


const addGoal = () => {

  if (!goalTitle || !goalTarget) return;

  const newGoal = {
    id: Date.now(),
    title: goalTitle,
    target: Number(goalTarget),
    saved: 0
  };

  setGoals([...goals, newGoal]);

  setGoalTitle("");
  setGoalTarget("");

  setShowGoalForm(false);
};

  useEffect(() => {
  Promise.all([
    api.get('/transactions'),
    api.get('/categories')
  ])
    .then(([txnRes, catRes]) => {

      const transactions = txnRes.data;
      const cats = catRes.data;

      setTransactions(transactions);
      setCategories(cats);

      // ✅ Category Bar Data
      let barData = getCategoryChartData(cats, transactions);

      // ✅ sort by total spending (highest first)
      barData.sort((a, b) => b.total - a.total);

      setCategoryBarData(barData);

      // ===== STATS =====
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        income,
        expense,
        balance: income - expense
      });

      // ===== CATEGORY MAP =====
      const categoryMap = {};

      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
      const category =
        t.categoryId?.name ||
        categories.find(
          c =>
            String(c._id) ===
            String(t.categoryId)
        )?.name ||
        "Other";
          categoryMap[category] =
            (categoryMap[category] || 0) + Number(t.amount);
        });

      // ===== RECENT =====
      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setRecentTransactions(sortedTransactions.slice(0, 5));

      // ===== PIE CHART =====
      const chartArray = Object.keys(categoryMap).map((key) => ({
        name: key,
        value: categoryMap[key]
      }));

      const sortedData = chartArray.sort((a, b) => b.value - a.value);

      const topCategories = sortedData.slice(0, 6);
      const others = sortedData.slice(6);

      if (others.length > 0) {
        const othersTotal = others.reduce((sum, item) => sum + item.value, 0);
        topCategories.push({ name: 'Others', value: othersTotal });
      }

      setChartData(topCategories);

      // ===== MONTHLY =====
      const monthMap = {};

      transactions.forEach((t) => {
        const date = new Date(t.date);
        const month = date.toLocaleString(
          "default",
          {
            month: "short",
            year: "numeric"
          }
        );
        if (!monthMap[month]) {
          monthMap[month] = 0;
        }

        if (t.type === 'expense') {
          monthMap[month] += Number(t.amount);
        }
      });

      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];

      const monthlyArray = Object.keys(monthMap)
        .map((key) => ({
          month: key,
          expense: monthMap[key]
        }))
        .sort((a, b) => {
          const [aMonth] = a.month.split(" ");
          const [bMonth] = b.month.split(" ");

          return (
            monthOrder.indexOf(aMonth) -
            monthOrder.indexOf(bMonth)
          );
        });
      setMonthlyData(monthlyArray);

      // ===== TREND =====
      const trendMap = {};

      transactions.forEach((t) => {
        const date = new Date(t.date);
        const month = date.toLocaleString('default', {
          month: 'short',
          year: 'numeric'
        });

        if (!trendMap[month]) {
          trendMap[month] = { month, income: 0, expense: 0 };
        }

        if (t.type === 'income') {
          trendMap[month].income += Number(t.amount);
        } else {
          trendMap[month].expense += Number(t.amount);
        }
      });

      const trendArray = Object.values(trendMap).sort(
        (a, b) => new Date(a.month + " 1") - new Date(b.month + " 1")
      );

      setTrendData(trendArray);

      setLoading(false);
    })
    .catch((err) => {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load transactions.'
      );
      setLoading(false);
    });

  // ===== BUDGET =====
  api.get('/users/profile')
    .then((res) => {
      setBudget(res.data.budget || 0);
    })
    .catch(() => {});
}, []);

    useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

useEffect(() => {

  localStorage.setItem(
    "goals",
    JSON.stringify(goals)
  );

}, [goals]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const formatCurrency = (n) =>
  `₹${Number(n).toLocaleString('en-IN')}`;

    const actualSavings = Math.max(
        stats.income - stats.expense,
        0
      );

      const savingsRate =
        stats.income > 0
          ? (
              (actualSavings / stats.income) * 100
            ).toFixed(1)
          : 0;

  const hasTransactions = stats.income > 0 || stats.expense > 0;
  const isExceeded = budget > 0 && stats.expense > budget;

  const updateBudget = async () => {
    try {
      await api.put('/users/budget', { budget });
      alert('Budget updated!');
    } catch {
      alert('Failed to update budget');
    }
  };

    const getAdvancedInsights = () => {
      if (!chartData.length) return ["Start adding data to see insights 📊"];

      const insights = [];

      // 1. Highest category
      const topCategory = chartData.reduce((a, b) =>
        a.value > b.value ? a : b
      );
      insights.push(`💸 Highest spending: ${topCategory.name}`);

      // 2. Savings insight
      if (savingsRate < 10) {
        insights.push("⚠️ Your savings are very low");
      } else if (savingsRate > 40) {
        insights.push("🔥 Excellent savings habit");
      }

      // 3. Budget warning
      if (isExceeded) {
        insights.push("🚨 You exceeded your budget");
      }

      // 4. Monthly trend
      if (monthlyData.length >= 2) {
        const last = monthlyData[monthlyData.length - 1].expense;
        const prev = monthlyData[monthlyData.length - 2].expense;

        if (last > prev) {
          insights.push("📈 Expenses increased compared to last month");
        } else {
          insights.push("📉 Good! Expenses decreased this month");
        }
      }

            // 5. Spending Personality
      const shoppingExpense = transactions
        .filter(
          t =>
            t.type === "expense" &&
            t.categoryId?.name?.toLowerCase().includes("shopping")
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      if (shoppingExpense > stats.expense * 0.4) {
        insights.push("🛍️ Personality: Impulse Spender");
      } else if (savingsRate > 30) {
        insights.push("💰 Personality: Smart Saver");
      } else {
        insights.push("✅ Personality: Balanced Spender");
      }

      // 6. Smart Alert
      if (stats.expense > stats.income * 0.9) {
        insights.push("🚨 Alert: Expenses are dangerously high");
      }

      // 7. Expense Spike Alert
      if (monthlyData.length >= 2) {
        const last = monthlyData[monthlyData.length - 1].expense;
        const prev = monthlyData[monthlyData.length - 2].expense;

        if (last > prev * 1.3) {
          insights.push("📊 Sudden expense spike detected");
        }
      }

      return insights;
    };

    const downloadPDF = async () => {
      const input = document.getElementById("dashboard-report");

      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();

      const height =(canvas.height * width) / canvas.width;

      pdf.addImage(imgData,"PNG",0,0,width,height);
      pdf.save("finance-report.pdf");
    };

    
    const addMoney = (id) => {

  const amount = prompt(
    "Enter contribution amount"
  );

  if (!amount ||isNaN(amount) ||Number(amount) <= 0)
     {
    alert("Enter valid amount");
    return;
    }

  setGoals(
    goals.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            saved:
              goal.saved + Number(amount)
          }
        : goal
    )
  );
};

  const deleteGoal = (id) => {

  setGoals(
    goals.filter((goal) => goal.id !== id)
  );
};

const isDark = theme === "dark";

  return (
  <div id="dashboard-report" className="container py-4">

    <h2 className="mb-1">Dashboard</h2>

    <div className="d-flex gap-2 mb-2">
      <Link to="/transaction/new" className="btn btn-primary">
        + Add Transaction
      </Link>
      <Link to="/transactions" className="btn btn-outline-secondary">
        View All
      </Link>
    </div>

    <p className="text-muted mb-4">
      Welcome to your personal finance overview
    </p>

    {!hasTransactions && (
      <div className="alert alert-info shadow-sm">
        <strong>Get started!</strong> Add transactions to see summary.
      </div>
    )}

    {/* ===== TOP CARDS ===== */}
    <div className="row g-4 mb-4">

      <div className="col-6 col-md-2">
        <div className="card shadow-sm border-0 p-3"
          
        >
          <h6 className="text-muted">Income</h6>
          <h4 className="text-success">
            ₹<CountUp end={stats.income} duration={1.5} />
          </h4>
        </div>
      </div>

      <div className="col-6 col-md-2">
        <div className="card shadow-sm border-0 p-3"
        
      >
          <h6 className="text-muted">Expenses</h6>
          <h4 className="text-danger">
            ₹<CountUp end={stats.expense} duration={1.5} />
          </h4>
        </div>
      </div> 

      <div className="col-6 col-md-2">
        <div className="card shadow-sm border-0 p-3">
          <h6 className="text-muted">Balance</h6>
          <h4 className={stats.balance >= 0 ? "text-success" : "text-danger"}>
            ₹<CountUp end={stats.balance} duration={1.5} />
          </h4>
        </div>
      </div>

      <div className="col-6 col-md-2">
        <div className="card shadow-sm border-0 p-3">
          <h6 className="text-muted">Budget</h6>

          <div className="d-flex align-items-center">
          <span className="fs-4 fw-bold me-1">₹</span>

          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateBudget();
              }
            }}
            className="form-control border-0 bg-transparent fw-bold fs-4 p-0"
          />
        </div>
        </div>
      </div>

      <div className="col-md-2">
        <div className="card shadow-sm border-0 p-3 text-center">
          <h6 className="text-muted">Savings</h6>
          <h4 className={savingsRate > 30 ? "text-success" : "text-warning"}>
            {savingsRate}% Saved
          </h4>
        </div>
      </div>

    </div>

    {isExceeded && (
      <div className="alert alert-danger shadow-sm">
        ⚠️ Budget exceeded! You are overspending.
      </div>
    )}

    <div className="row g-4 mb-4">

  {/* LEFT SIDE */}
  <div className="col-md-7 d-flex flex-column gap-4">


    {/* ===== BUDGET USAGE ===== */}
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5
          className="fw-bold mb-0"
          style={{
            color: isDark ? "#000000" : "#ffffff"
          }}
        >
          Budget Usage
        </h5>
        <span className="badge bg-success fs-6">
          {budget > 0
            ? Math.min((stats.expense / budget) * 100, 100).toFixed(0)
            : 0}%
        </span>
      </div>

      <div
        className="progress mb-3"
        style={{
          height: "14px",
          borderRadius: "10px"
        }}
      >
        <div
          className={`progress-bar ${
            stats.expense > budget
              ? "bg-danger"
              : "bg-success"
          }`}
          style={{
            width: `${
              budget > 0
                ? Math.min((stats.expense / budget) * 100, 100)
                : 0
            }%`
          }}
        />
      </div>

      <small className="text-muted">
        {formatCurrency(stats.expense)} used from{" "}
        {formatCurrency(budget)}
      </small>
    </div>

    <div className="row g-4 mb-4">

 
    {/* Smart Insights */}
    <div
      className="card shadow-sm border-0 p-3"
      style={{ height: "180px" }}
    >
      <h6 className="mb-3">Smart Insights</h6>

      <div
        className="d-flex flex-column gap-2 pe-1"
        style={{
          overflowY: "auto",
          maxHeight: "120px"
        }}
      >
        {getAdvancedInsights().map((insight, i) => (
          <div
            key={i}
            className="p-2 rounded"
            style={{
              background:
                theme === "dark"
                  ? "#1e293b"
                  : "#f8fafc",

              border:
                theme === "dark"
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(0,0,0,0.06)"
            }}
                      >
                      <small
              style={{
              color:
                theme === "dark"
                  ? "#f8fafc"
                  : "#111827"
            }}
            >
              💡 {insight}
            </small>
          </div>
        ))}
      </div>
    </div>
</div>
</div>

  {/* RIGHT SIDE */}
  <div className="col-lg-5"
  style={{ height: "100%" }}
    >
    {/* ===== SAVING GOALS ===== */}
<div
  className="card shadow-sm border-0 p-4"
  style={{
    height: "320px",
    borderRadius: "18px"
  }}
>

  {/* HEADER */}
  <div className="d-flex justify-content-between align-items-center mb-3">

    <h5 className="mb-0">Saving Goals</h5>

    <button
      className="btn btn-primary btn-sm rounded-pill"
      onClick={() => setShowGoalForm(!showGoalForm)}
    >
      + Goal
    </button>

  </div>

  {/* GOAL FORM */}
  {showGoalForm && (
    <div className="mb-3">

      <input
        type="text"
        placeholder="Goal name"
        value={goalTitle}
        onChange={(e) => setGoalTitle(e.target.value)}
        className="form-control mb-2"
      />

      <input
        type="number"
        placeholder="Target amount"
        value={goalTarget}
        onChange={(e) => setGoalTarget(e.target.value)}
        className="form-control mb-2"
      />

      <button
        className="btn btn-success btn-sm"
        onClick={addGoal}
      >
        Save Goal
      </button>

    </div>
  )}

  {/* GOALS LIST */}
<div
  style={{
    overflowY: "auto",
    maxHeight: "180px"
  }}
>

  {goals.length === 0 ? (

    <div className="text-center text-muted mt-4">
      <p className="mb-1">No saving goals yet 🎯</p>

      <small>
        Create goals and track your savings progress
      </small>
    </div>

  ) : (

    goals.map((goal) => {

      const progress =
        (goal.saved / goal.target) * 100;

      return (

        <div
          key={goal.id}
          className="p-3 rounded mb-3"
          style={{
            background:
              theme === "dark"
                ? "rgba(255,255,255,0.04)"
                : "#f8fafc",

            border:
              theme === "dark"
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.08)"
          }}
        >

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-2">

            <h6 className="mb-0">
              🎯 {goal.title}
            </h6>

            <span className="badge bg-success">
              {progress.toFixed(0)}%
            </span>

          </div>

          {/* SAVED TEXT */}
          <small
            style={{
              color:
                theme === "dark"
                  ? "#f8fafc"
                  : "#111827"
            }}
          >
            ₹{goal.saved.toLocaleString()} saved of ₹
            {goal.target.toLocaleString()}
          </small>

          {/* PROGRESS */}
          <div className="progress mt-2">

            <div
              className="progress-bar bg-success"
              style={{
                width: `${progress}%`
              }}
            />

          </div>

          {/* ACTIONS */}
          <div className="d-flex gap-2 mt-3">

            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => addMoney(goal.id)}
            >
              Contribute
            </button>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => deleteGoal(goal.id)}
            >
              Delete
            </button>

          </div>

        </div>
      );
    })

  )}

</div>


</div>

  </div>

</div>

    {/* ===== CHARTS ===== */}
    <div className="card shadow-sm border-0 p-4">
      <h5 className="mb-4 text-center">Analytics</h5>

      {chartData.length === 0 ? (
        <div className="text-center text-muted">
          <p>No expense data yet 📊</p>
          <Link to="/transaction/new" className="btn btn-sm btn-primary">
            Add your first expense
          </Link>
        </div>
      ) : (
        <>
          <div className="row">

            {/* PIE */}
            <div className="col-md-6 d-flex flex-column align-items-center">
              <h6 className="mb-3">Expense Breakdown</h6>

              <PieChart width={350} height={300}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            {/* LINE */}
            <div className="col-md-6 d-flex flex-column align-items-center">
              <h6 className="mb-3">Income vs Expense</h6>

              {trendData.length === 0 ? (
                <p className="text-muted">No data</p>
              ) : (
                <LineChart width={350} height={300} data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#00C49F" />
                  <Line type="monotone" dataKey="expense" stroke="#FF4560" />
                </LineChart>
              )}
            </div>

          </div>

          <p className="mt-4 text-center">
            Highest spending:{" "}
            <strong>
              {chartData.reduce((a, b) => (a.value > b.value ? a : b)).name}
            </strong>
          </p>
        </>
      )}
    </div>

    <div className="row mt-4 g-4">

  {/* ===== CATEGORY STACKED BAR ===== */}
  <div className="col-md-8">
    <div className="card shadow-sm border-0 p-4 h-100">
      <h5 className="mb-3">Category Breakdown</h5>

      {categoryBarData.length === 0 ? (
        <p className="text-muted">No category data</p>
      ) : (
        <BarChart width={650} height={300} data={categoryBarData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />

          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />

           {[...new Set(

              categoryBarData.flatMap((item) =>
                Object.keys(item)
              )

            )]
              .filter(
                (key) =>
                  key !== "name" &&
                  key !== "total"
              )
              .map((key, index) => (

                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                />

            ))}
        </BarChart>
      )}
    </div>
  </div>

  {/* ===== RECENT TRANSACTIONS ===== */}
  <div className="col-md-4">
    <div className="card shadow-sm border-0 p-4 h-100">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-semibold">Recent Transactions</h6>

        <Link to="/transactions" className="text-decoration-none small">
          View All →
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <p className="text-muted">No recent transactions</p>
      ) : (
        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          {recentTransactions.map((t, i) => (
            <div
              key={i}
              className="d-flex justify-content-between align-items-center py-2 border-bottom"
            >
              <div>
                <div className="fw-medium">
                  {t.type === "income"
                    ? "Income"
                    : t.categoryId?.name || "Other"}
                </div>

                <small className="text-muted">
                  {new Date(t.date).toLocaleDateString()}
                </small>
              </div>

              <div
                className={`fw-semibold ${
                  t.type === "income"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                ₹{Number(t.amount).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>

</div>

 
    {/* ===== MONTHLY ===== */}
    <div className="card shadow-sm border-0 p-4 mt-4">
      <h5 className="mb-3">Monthly Expenses</h5>

      {monthlyData.length === 0 ? (
        <p className="text-muted">No data available</p>
      ) : (
        <BarChart width={500} height={350} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="expense" fill="#7703fc" />
        </BarChart>
      )}
    </div>

     <div className="text-end mt-3">
  <button className="btn btn-success" onClick={downloadPDF}>
    Download Report
  </button>
</div>

  </div>
);
};

export default Dashboard;