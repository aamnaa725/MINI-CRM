import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiFetch";

import {
  FaChartLine,
  FaUsers,
  FaHandshake,
  FaDollarSign,
  FaHome,
  FaUserPlus,
  FaUserTie,
  FaCog,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";

import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const stats = [
    {
      title: "Total Leads",
      value: "1,248",
      change: "+12.5%",
      description: "vs last month",
      icon: <FaUsers />,
      iconClass: "blue",
      changeClass: "positive",
    },
    {
      title: "Qualified Leads",
      value: "846",
      change: "+8.2%",
      description: "vs last month",
      icon: <FaUserTie />,
      iconClass: "purple",
      changeClass: "positive",
    },
    {
      title: "Deals Closed",
      value: "126",
      change: "+15.4%",
      description: "vs last month",
      icon: <FaHandshake />,
      iconClass: "green",
      changeClass: "positive",
    },
    {
      title: "Revenue",
      value: "$48,250",
      change: "+10.8%",
      description: "vs last month",
      icon: <FaDollarSign />,
      iconClass: "orange",
      changeClass: "positive",
    },
  ];

  const deals = [
    {
      name: "New Leads",
      value: "88%",
      className: "blue-fill",
    },
    {
      name: "Qualified",
      value: "75%",
      className: "purple-fill",
    },
    {
      name: "Proposal",
      value: "65%",
      className: "orange-fill",
    },
    {
      name: "Negotiation",
      value: "50%",
      className: "pink-fill",
    },
    {
      name: "Closed",
      value: "65%",
      className: "green-fill",
    },
  ];

  const leads = [
    {
      name: "John Smith",
      company: "Acme Inc.",
      status: "New",
      statusClass: "new-status",
      value: "$4,500",
    },
    {
      name: "Sarah Johnson",
      company: "Tech Solutions",
      status: "Contacted",
      statusClass: "contacted-status",
      value: "$7,200",
    },
    {
      name: "Michael Brown",
      company: "Global Systems",
      status: "Proposal",
      statusClass: "proposal-status",
      value: "$9,800",
    },
    {
      name: "Emily Davis",
      company: "Bright Labs",
      status: "New",
      statusClass: "new-status",
      value: "$3,600",
    },
  ];

  const filteredLeads = leads.filter((lead) =>
    `${lead.name} ${lead.company}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = async () => {
    try {
      // Call the backend to clear the JWT cookie and reset the token in the DB
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to log out from backend:", error);
    }

    // Clear login session
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("user");

    // Clear OTP / authentication flow data
    sessionStorage.removeItem("resetEmail");
    sessionStorage.removeItem("otpFlow");
    sessionStorage.removeItem("resetPasswordVerified");

    // Clear old localStorage values if they exist
    localStorage.removeItem("user");
    localStorage.removeItem("rememberedEmail");

    // Replace instead of normal navigation.
    // This prevents returning to Dashboard with the Back button.
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      {/* ===========================
          SIDEBAR
      =========================== */}

      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>Mini CRM</h2>
          <span>PRO</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-title">MAIN</p>

          <button className="sidebar-item active">
            <span>
              <FaHome />
            </span>
            Dashboard
          </button>

          <button className="sidebar-item">
            <span>
              <FaUsers />
            </span>
            Leads
          </button>

          <button className="sidebar-item">
            <span>
              <FaHandshake />
            </span>
            Deals
          </button>

          <button className="sidebar-item">
            <span>
              <FaChartLine />
            </span>
            Analytics
          </button>
        </div>

        <div className="sidebar-section bottom-section">
          <p className="sidebar-title">MANAGE</p>

          <button className="sidebar-item">
            <span>
              <FaUserPlus />
            </span>
            Add Lead
          </button>

          <button className="sidebar-item">
            <span>
              <FaCog />
            </span>
            Settings
          </button>

          <button
            type="button"
            className="sidebar-item"
            onClick={handleLogout}
          >
            <span>
              <FaSignOutAlt />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ===========================
          MAIN CONTENT
      =========================== */}

      <main className="dashboard-content">
        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back! Here's what's happening with your
              business today.
            </p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <span>
                <FaSearch />
              </span>

              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button type="button" className="add-lead-btn">
              + Add Lead
            </button>
          </div>
        </header>

        {/* ===========================
            STATS
        =========================== */}

        <section className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <span>{stat.title}</span>

                <div
                  className={`stat-icon ${stat.iconClass}`}
                >
                  {stat.icon}
                </div>
              </div>

              <h2>{stat.value}</h2>

              <p className={stat.changeClass}>
                {stat.change}{" "}
                <span>{stat.description}</span>
              </p>
            </div>
          ))}
        </section>

        {/* ===========================
            MIDDLE GRID
        =========================== */}

        <section className="middle-grid">
          {/* REVENUE */}

          <div className="dashboard-card revenue-card">
            <div className="card-heading">
              <h3>Revenue Overview</h3>

              <p>Monthly revenue performance</p>
            </div>

            <div className="revenue-value">
              <strong>$48,250</strong>

              <span>+10.8%</span>
            </div>

            <div className="chart">
              <div className="chart-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="chart-line line-one" />
              <div className="chart-line line-two" />
              <div className="chart-line line-three" />
              <div className="chart-line line-four" />

              <div className="chart-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          {/* DEALS */}

          <div className="dashboard-card deals-card">
            <div className="card-heading">
              <h3>Deal Progress</h3>

              <p>Current pipeline progress</p>
            </div>

            {deals.map((deal) => (
              <div className="deal-row" key={deal.name}>
                <span>{deal.name}</span>

                <div className="progress">
                  <div
                    className={`progress-fill ${deal.className}`}
                    style={{
                      width: deal.value,
                    }}
                  />
                </div>

                <strong>{deal.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* ===========================
            RECENT LEADS
        =========================== */}

        <section className="dashboard-card recent-card">
          <div className="recent-header">
            <div>
              <h3>Recent Leads</h3>

              <p>
                Latest leads added to your pipeline
              </p>
            </div>

            <button
              type="button"
              className="view-all-btn"
            >
              View All
            </button>
          </div>

          <div className="leads-table">
            <div className="table-head">
              <span>Name</span>
              <span>Company</span>
              <span>Status</span>
              <span>Value</span>
            </div>

            {filteredLeads.map((lead) => (
              <div
                className="lead-row"
                key={`${lead.name}-${lead.company}`}
              >
                <span>{lead.name}</span>

                <span>{lead.company}</span>

                <span>
                  <span
                    className={`status ${lead.statusClass}`}
                  >
                    {lead.status}
                  </span>
                </span>

                <span>{lead.value}</span>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <div className="lead-row">
                <span>No leads found.</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;