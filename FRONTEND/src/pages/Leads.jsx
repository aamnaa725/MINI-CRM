import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Leads.css";
import "../styles/AddLeadModal.css";
import { useAuthUser } from "../hooks/useAuthUser";
import Sidebar from "../components/Sidebar";
import AddLeadModal from "../components/AddLeadModal";
import { ROLES } from "../config/dashboardConfig";
import { LEADS_COPY, LEAD_FILTERS, statusClass } from "../config/leadsConfig";


function Leads() {
  const { user, logout } = useAuthUser();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState([]);

  // Backend doesn't issue a role yet, so default to Org Admin until RBAC lands.
  const role = user?.role || ROLES.ORG_ADMIN;
  const copy = LEADS_COPY[role];

  // Seed local rows from the mock config once we know which role's dataset
  // to use (new leads added via the modal live only in this state for now,
  // since there's no leads API yet).
  useEffect(() => {
    setRows(copy?.rows || []);
  }, [copy]);

  // Hooks must run on every render regardless of the early returns below,
  // so this stays above them.
  const filteredRows = useVisibleRows(rows, activeFilter, search);

  if (!user) {
    return null;
  }

  // Super Admin operates at the platform level, not inside a single org's pipeline.
  if (!copy) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAddLead = (lead) => {
    setRows((prev) => [lead, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-page">

      <Sidebar user={user} role={role} onLogout={logout} />

      <main className="dashboard-content">

        <header className="dashboard-header">
          <div>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="add-lead-btn" onClick={() => setIsModalOpen(true)}>
              {copy.addButtonLabel}
            </button>
          </div>
        </header>


        <section className="stats-grid leads-stats-grid">
          {copy.statCards.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-top">
                <span>{stat.label}</span>
                <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              </div>
              <h2>{stat.value}</h2>
            </div>
          ))}
        </section>


        <section className="dashboard-card leads-table-card">

          <div className="leads-filter-bar">
            {LEAD_FILTERS.map((filter) => (
              <button
                key={filter}
                className={`filter-chip ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="leads-table full-leads-table" data-with-owner={copy.showOwner}>

            <div className="table-head">
              <span>Name</span>
              <span>Company</span>
              <span>Email</span>
              {copy.showOwner && <span>Owner</span>}
              <span>Status</span>
              <span>Value</span>
            </div>

            {filteredRows.length === 0 && (
              <div className="leads-empty">No leads match your filters.</div>
            )}

            {filteredRows.map((lead, index) => (
              <div className="lead-row" key={index}>
                <span>{lead.name}</span>
                <span>{lead.company}</span>
                <span>{lead.email}</span>
                {copy.showOwner && <span>{lead.owner}</span>}
                <span className={`status ${statusClass(lead.status)}`}>
                  {lead.status}
                </span>
                <span>{lead.value}</span>
              </div>
            ))}

          </div>

        </section>

      </main>

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLead}
        showOwner={copy.showOwner}
      />

    </div>
  );
}

function useVisibleRows(rows, activeFilter, search) {
  return useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((lead) => {
      const matchesFilter = activeFilter === "All" || lead.status === activeFilter;

      const matchesSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [rows, activeFilter, search]);
}

export default Leads;
