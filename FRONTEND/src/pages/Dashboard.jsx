import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {

    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    // User clicked Cancel
    if (!confirmed) {
      return;
    }

    // Remove logged-in user
    localStorage.removeItem("user");

    // Clear any reset/OTP session data
    sessionStorage.removeItem("resetEmail");
    sessionStorage.removeItem("otpVerified");

    // Redirect to login
    navigate("/login", {
      replace: true,
    });
  };


  return (

    <div className="dashboard-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          <h2>Mini CRM</h2>
          <span>CRM</span>
        </div>

        <div className="sidebar-section">

          <p className="sidebar-title">
            WORKSPACE
          </p>

          <button className="sidebar-item active">
            <span>▦</span>
            Overview
          </button>

          <button className="sidebar-item">
            <span>◎</span>
            Leads
          </button>

          <button className="sidebar-item">
            <span>●</span>
            Customers
          </button>

          <button className="sidebar-item">
            <span>◇</span>
            Deals
          </button>

          <button className="sidebar-item">
            <span>✓</span>
            Tasks
          </button>

          <button className="sidebar-item">
            <span>◷</span>
            Activities
          </button>

          <button className="sidebar-item">
            <span>▤</span>
            Reports
          </button>

        </div>


        <div className="sidebar-section bottom-section">

          <p className="sidebar-title">
            MANAGE
          </p>

          <button className="sidebar-item">
            <span>⚙</span>
            Settings
          </button>

          <button className="sidebar-item">
            <span>♙</span>
            Team Members
          </button>

          {/* ================= LOGOUT ================= */}

          <button
            className="sidebar-item logout-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-content">

        {/* Header */}

        <header className="dashboard-header">

          <div>

            <h1>
              Good morning!
            </h1>

            <p>
              Here's what's happening with your sales team today.
            </p>

          </div>


          <div className="header-actions">

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search anything..."
              />

            </div>


            <button className="add-lead-btn">
              + Add new lead
            </button>

          </div>

        </header>


        {/* ================= STAT CARDS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-top">

              <span>
                Total Leads
              </span>

              <div className="stat-icon blue">
                ◎
              </div>

            </div>

            <h2>
              1,284
            </h2>

            <p className="positive">
              +12.4% <span>vs last month</span>
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Active Deals
              </span>

              <div className="stat-icon purple">
                ◇
              </div>

            </div>

            <h2>
              86
            </h2>

            <p className="positive">
              +8.2% <span>vs last month</span>
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Revenue
              </span>

              <div className="stat-icon green">
                $
              </div>

            </div>

            <h2>
              $248.6K
            </h2>

            <p className="positive">
              +18.1% <span>vs last month</span>
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Win Rate
              </span>

              <div className="stat-icon orange">
                %
              </div>

            </div>

            <h2>
              32.8%
            </h2>

            <p className="negative">
              -4.3% <span>vs last month</span>
            </p>

          </div>

        </section>


        {/* ================= MIDDLE SECTION ================= */}

        <section className="middle-grid">

          {/* Revenue */}

          <div className="dashboard-card revenue-card">

            <div className="card-heading">

              <div>

                <h3>
                  Revenue Overview
                </h3>

                <p>
                  Monthly performance
                </p>

              </div>

            </div>


            <div className="revenue-value">

              <strong>
                $248,620
              </strong>

              <span>
                +18.1% from last month
              </span>

            </div>


            <div className="chart">

              <div className="chart-lines">

                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>


              <div className="chart-line line-one"></div>
              <div className="chart-line line-two"></div>
              <div className="chart-line line-three"></div>
              <div className="chart-line line-four"></div>


              <div className="chart-labels">

                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>

              </div>

            </div>

          </div>


          {/* Deals */}

          <div className="dashboard-card deals-card">

            <div className="card-heading">

              <div>

                <h3>
                  Deals by Stage
                </h3>

                <p>
                  86 active deals · $412K value
                </p>

              </div>

            </div>


            <div className="deal-row">

              <span>
                New
              </span>

              <div className="progress">
                <div className="progress-fill blue-fill"></div>
              </div>

              <strong>
                24
              </strong>

            </div>


            <div className="deal-row">

              <span>
                Contacted
              </span>

              <div className="progress">
                <div className="progress-fill purple-fill"></div>
              </div>

              <strong>
                18
              </strong>

            </div>


            <div className="deal-row">

              <span>
                Proposal
              </span>

              <div className="progress">
                <div className="progress-fill orange-fill"></div>
              </div>

              <strong>
                16
              </strong>

            </div>


            <div className="deal-row">

              <span>
                Negotiation
              </span>

              <div className="progress">
                <div className="progress-fill pink-fill"></div>
              </div>

              <strong>
                12
              </strong>

            </div>


            <div className="deal-row">

              <span>
                Won
              </span>

              <div className="progress">
                <div className="progress-fill green-fill"></div>
              </div>

              <strong>
                16
              </strong>

            </div>

          </div>

        </section>


        {/* ================= RECENT LEADS ================= */}

        <section className="dashboard-card recent-card">

          <div className="recent-header">

            <div>

              <h3>
                Recent Leads
              </h3>

              <p>
                Your latest sales opportunities
              </p>

            </div>


            <button className="view-all-btn">
              View all leads →
            </button>

          </div>


          <div className="leads-table">

            <div className="table-head">

              <span>Name</span>
              <span>Company</span>
              <span>Status</span>
              <span>Value</span>

            </div>


            <div className="lead-row">

              <span>
                John Doe
              </span>

              <span>
                Acme Inc.
              </span>

              <span className="status new-status">
                New
              </span>

              <span>
                $12,500
              </span>

            </div>


            <div className="lead-row">

              <span>
                Jane Smith
              </span>

              <span>
                Globex Corp.
              </span>

              <span className="status contacted-status">
                Contacted
              </span>

              <span>
                $8,200
              </span>

            </div>


            <div className="lead-row">

              <span>
                Mike Brown
              </span>

              <span>
                Tech Solutions
              </span>

              <span className="status proposal-status">
                Proposal
              </span>

              <span>
                $15,800
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>

  );
}

export default Dashboard;