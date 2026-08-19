import { Link, useLocation } from "react-router-dom";
import { ROLES, ROLE_LABELS, NAV_CONFIG } from "../config/dashboardConfig";

function NavButton({ item, isActive }) {
  const className = `sidebar-item ${isActive ? "active" : ""}`;

  if (item.path) {
    return (
      <Link to={item.path} className={className}>
        <span>{item.icon}</span>
        {item.label}
      </Link>
    );
  }

  return (
    <button className={className} disabled>
      <span>{item.icon}</span>
      {item.label}
    </button>
  );
}

function Sidebar({ user, role, onLogout }) {
  const location = useLocation();
  const nav = NAV_CONFIG[role];
  const initial = user.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="dashboard-sidebar">

      <div className="dashboard-logo">
        <h2>Mini CRM</h2>
        <span>CRM</span>
      </div>

      {role !== ROLES.SUPER_ADMIN && user.orgName && (
        <div className="org-badge">
          <span className="org-dot"></span>
          <span className="org-name">{user.orgName}</span>
        </div>
      )}

      <div className="sidebar-section">
        <p className="sidebar-title">WORKSPACE</p>

        {nav.workspace.map((item) => (
          <NavButton
            key={item.key}
            item={item}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>

      {nav.manage.length > 0 && (
        <div className="sidebar-section bottom-section">
          <p className="sidebar-title">MANAGE</p>

          {nav.manage.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      )}

      <div className={`sidebar-section ${nav.manage.length === 0 ? "bottom-section" : ""}`}>
        <div className="sidebar-profile">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-info">
            <p className="profile-name">{user.fullName}</p>
            <p className="profile-role">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <button className="sidebar-item logout-item" onClick={onLogout}>
          <span>⏻</span>
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
