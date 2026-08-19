// Central place to add/rename roles as backend RBAC lands.
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  SALES_MANAGER: "sales_manager",
  SALES_REP: "sales_rep",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ORG_ADMIN]: "Org Admin",
  [ROLES.SALES_MANAGER]: "Sales Manager",
  [ROLES.SALES_REP]: "Sales Rep",
};

// Sidebar navigation, grouped the same way as the existing markup
// (a "WORKSPACE" section and a "MANAGE" section pinned to the bottom).
// Items with a `path` are real, routed pages (rendered as <Link>s in the
// sidebar); items without one are still visual-only placeholders.
export const NAV_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    workspace: [
      { key: "overview", icon: "▦", label: "Platform Overview", path: "/dashboard" },
      { key: "organizations", icon: "▣", label: "Organizations" },
      { key: "billing", icon: "$", label: "Subscriptions & Billing" },
      { key: "users", icon: "◍", label: "Platform Users" },
      { key: "reports", icon: "▤", label: "System Reports" },
    ],
    manage: [
      { key: "audit", icon: "≣", label: "Audit Logs" },
      { key: "settings", icon: "⚙", label: "Settings" },
    ],
  },

  [ROLES.ORG_ADMIN]: {
    workspace: [
      { key: "overview", icon: "▦", label: "Overview", path: "/dashboard" },
      { key: "leads", icon: "◎", label: "Leads", path: "/leads" },
      { key: "customers", icon: "●", label: "Customers" },
      { key: "deals", icon: "◇", label: "Deals" },
      { key: "tasks", icon: "✓", label: "Tasks" },
      { key: "activities", icon: "◷", label: "Activities" },
      { key: "reports", icon: "▤", label: "Reports" },
    ],
    manage: [
      { key: "settings", icon: "⚙", label: "Org Settings" },
      { key: "team", icon: "♙", label: "Team Members" },
      { key: "billing", icon: "$", label: "Billing" },
    ],
  },

  [ROLES.SALES_MANAGER]: {
    workspace: [
      { key: "overview", icon: "▦", label: "Overview", path: "/dashboard" },
      { key: "leads", icon: "◎", label: "Leads", path: "/leads" },
      { key: "customers", icon: "●", label: "Customers" },
      { key: "deals", icon: "◇", label: "Deals" },
      { key: "tasks", icon: "✓", label: "Tasks" },
      { key: "activities", icon: "◷", label: "Activities" },
      { key: "reports", icon: "▤", label: "Team Reports" },
    ],
    manage: [{ key: "team", icon: "♙", label: "Team Members" }],
  },

  [ROLES.SALES_REP]: {
    workspace: [
      { key: "overview", icon: "▦", label: "My Dashboard", path: "/dashboard" },
      { key: "leads", icon: "◎", label: "My Leads", path: "/leads" },
      { key: "customers", icon: "●", label: "My Customers" },
      { key: "deals", icon: "◇", label: "My Deals" },
      { key: "tasks", icon: "✓", label: "My Tasks" },
      { key: "activities", icon: "◷", label: "Activities" },
    ],
    manage: [],
  },
};

// Copy + mock stat cards for the dashboard body, per role.
export const DASHBOARD_COPY = {
  [ROLES.SUPER_ADMIN]: {
    subtitle: "Here's how every organization on Mini CRM is doing today.",
    addButtonLabel: "+ New Organization",
    statCards: [
      { label: "Total Organizations", value: "312", icon: "▣", color: "blue", trend: "+6.1%", positive: true },
      { label: "Active Subscriptions", value: "284", icon: "$", color: "green", trend: "+3.4%", positive: true },
      { label: "Platform MRR", value: "$92.4K", icon: "◇", color: "purple", trend: "+11.2%", positive: true },
      { label: "Churned Orgs", value: "7", icon: "%", color: "orange", trend: "-1.8%", positive: false },
    ],
    tableTitle: "Recent Organizations",
    tableSubtitle: "Latest sign-ups across the platform",
    tableColumns: ["Organization", "Plan", "Status", "MRR"],
    tableRows: [
      { a: "Acme Inc.", b: "Pro", status: "Active", statusClass: "new-status", c: "$499" },
      { a: "Globex Corp.", b: "Team", status: "Trial", statusClass: "contacted-status", c: "$0" },
      { a: "Tech Solutions", b: "Pro", status: "Past Due", statusClass: "proposal-status", c: "$499" },
    ],
    viewAllLabel: "View all organizations →",
  },

  [ROLES.ORG_ADMIN]: {
    subtitle: "Here's what's happening with your sales team today.",
    addButtonLabel: "+ Add new lead",
    statCards: [
      { label: "Total Leads", value: "1,284", icon: "◎", color: "blue", trend: "+12.4%", positive: true },
      { label: "Active Deals", value: "86", icon: "◇", color: "purple", trend: "+8.2%", positive: true },
      { label: "Revenue", value: "$248.6K", icon: "$", color: "green", trend: "+18.1%", positive: true },
      { label: "Win Rate", value: "32.8%", icon: "%", color: "orange", trend: "-4.3%", positive: false },
    ],
    tableTitle: "Recent Leads",
    tableSubtitle: "Your latest sales opportunities",
    tableColumns: ["Name", "Company", "Status", "Value"],
    tableRows: [
      { a: "John Doe", b: "Acme Inc.", status: "New", statusClass: "new-status", c: "$12,500" },
      { a: "Jane Smith", b: "Globex Corp.", status: "Contacted", statusClass: "contacted-status", c: "$8,200" },
      { a: "Mike Brown", b: "Tech Solutions", status: "Proposal", statusClass: "proposal-status", c: "$15,800" },
    ],
    viewAllLabel: "View all leads →",
  },

  [ROLES.SALES_MANAGER]: {
    subtitle: "Here's how your team is pacing this month.",
    addButtonLabel: "+ Add new lead",
    statCards: [
      { label: "Team Leads", value: "412", icon: "◎", color: "blue", trend: "+9.7%", positive: true },
      { label: "Team Deals", value: "34", icon: "◇", color: "purple", trend: "+5.5%", positive: true },
      { label: "Team Revenue", value: "$96.2K", icon: "$", color: "green", trend: "+14.3%", positive: true },
      { label: "Team Win Rate", value: "29.1%", icon: "%", color: "orange", trend: "+2.1%", positive: true },
    ],
    tableTitle: "Team's Recent Leads",
    tableSubtitle: "Latest opportunities from your team",
    tableColumns: ["Name", "Rep", "Status", "Value"],
    tableRows: [
      { a: "John Doe", b: "Alex Kim", status: "New", statusClass: "new-status", c: "$12,500" },
      { a: "Jane Smith", b: "Priya Rao", status: "Contacted", statusClass: "contacted-status", c: "$8,200" },
      { a: "Mike Brown", b: "Alex Kim", status: "Proposal", statusClass: "proposal-status", c: "$15,800" },
    ],
    viewAllLabel: "View team leads →",
  },

  [ROLES.SALES_REP]: {
    subtitle: "Here's what's on your plate today.",
    addButtonLabel: "+ Add new lead",
    statCards: [
      { label: "My Leads", value: "58", icon: "◎", color: "blue", trend: "+4.2%", positive: true },
      { label: "My Deals", value: "11", icon: "◇", color: "purple", trend: "+1.0%", positive: true },
      { label: "My Revenue", value: "$18.4K", icon: "$", color: "green", trend: "+9.6%", positive: true },
      { label: "My Win Rate", value: "36.0%", icon: "%", color: "orange", trend: "+3.3%", positive: true },
    ],
    tableTitle: "My Recent Leads",
    tableSubtitle: "Opportunities assigned to you",
    tableColumns: ["Name", "Company", "Status", "Value"],
    tableRows: [
      { a: "John Doe", b: "Acme Inc.", status: "New", statusClass: "new-status", c: "$12,500" },
      { a: "Jane Smith", b: "Globex Corp.", status: "Contacted", statusClass: "contacted-status", c: "$8,200" },
    ],
    viewAllLabel: "View all my leads →",
  },
};
