import "../styles/Dashboard.css";
import { useAuthUser } from "../hooks/useAuthUser";
import Sidebar from "../components/Sidebar";
import { ROLES, DASHBOARD_COPY } from "../config/dashboardConfig";


function Dashboard() {
  const { user, logout } = useAuthUser();

  if (!user) {
    return null;
  }

  // Backend doesn't issue a role yet, so default to Org Admin until RBAC lands.
  const role = user.role || ROLES.ORG_ADMIN;
  const copy = DASHBOARD_COPY[role];
  const firstName = user.fullName?.split(" ")[0] || "there";

  return (
    <div className="dashboard-page">

      <Sidebar user={user} role={role} onLogout={logout} />


      {/* ================= MAIN CONTENT ================= */}
      <main className="dashboard-content">

        {/* Header */}
        <header className="dashboard-header">

          <div>
            <h1>Good morning, {firstName}!</h1>
            <p>{copy.subtitle}</p>
          </div>

          <div className="header-actions">

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search anything..."
              />
            </div>

            <button className="notif-btn" aria-label="Notifications">
              🔔
              <span className="notif-dot"></span>
            </button>

            <button className="add-lead-btn">
              {copy.addButtonLabel}
            </button>

          </div>

        </header>


        {/* ================= STAT CARDS ================= */}
        <section className="stats-grid">

          {copy.statCards.map((stat) => (
            <div className="stat-card" key={stat.label}>

              <div className="stat-top">
                <span>{stat.label}</span>
                <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              </div>

              <h2>{stat.value}</h2>

              <p className={stat.positive ? "positive" : "negative"}>
                {stat.trend} <span>vs last month</span>
              </p>

            </div>
          ))}

        </section>


        {/* ================= MIDDLE SECTION ================= */}
        <section className="middle-grid">

          {/* Revenue */}
          <div className="dashboard-card revenue-card">

            <div className="card-heading">
              <div>
                <h3>Revenue Overview</h3>
                <p>Monthly performance</p>
              </div>
            </div>

            <div className="revenue-value">
              <strong>$248,620</strong>
              <span>+18.1% from last month</span>
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
                <h3>Deals by Stage</h3>
                <p>86 active deals · $412K value</p>
              </div>
            </div>


            <div className="deal-row">
              <span>New</span>

              <div className="progress">
                <div className="progress-fill blue-fill"></div>
              </div>

              <strong>24</strong>
            </div>


            <div className="deal-row">
              <span>Contacted</span>

              <div className="progress">
                <div className="progress-fill purple-fill"></div>
              </div>

              <strong>18</strong>
            </div>


            <div className="deal-row">
              <span>Proposal</span>

              <div className="progress">
                <div className="progress-fill orange-fill"></div>
              </div>

              <strong>16</strong>
            </div>


            <div className="deal-row">
              <span>Negotiation</span>

              <div className="progress">
                <div className="progress-fill pink-fill"></div>
              </div>

              <strong>12</strong>
            </div>


            <div className="deal-row">
              <span>Won</span>

              <div className="progress">
                <div className="progress-fill green-fill"></div>
              </div>

              <strong>16</strong>
            </div>

          </div>

        </section>


        {/* ================= RECENT TABLE ================= */}
        <section className="dashboard-card recent-card">

          <div className="recent-header">
            <div>
              <h3>{copy.tableTitle}</h3>
              <p>{copy.tableSubtitle}</p>
            </div>

            <button className="view-all-btn">
              {copy.viewAllLabel}
            </button>
          </div>


          <div className="leads-table">

            <div className="table-head">
              {copy.tableColumns.map((col) => (
                <span key={col}>{col}</span>
              ))}
            </div>

            {copy.tableRows.map((row, index) => (
              <div className="lead-row" key={index}>
                <span>{row.a}</span>
                <span>{row.b}</span>
                <span className={`status ${row.statusClass}`}>
                  {row.status}
                </span>
                <span>{row.c}</span>
              </div>
            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
