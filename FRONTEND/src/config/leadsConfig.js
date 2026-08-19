import { ROLES } from "./dashboardConfig";

export const LEAD_FILTERS = ["All", "New", "Contacted", "Proposal", "Negotiation", "Won"];

const STATUS_CLASS = {
  New: "new-status",
  Contacted: "contacted-status",
  Proposal: "proposal-status",
  Negotiation: "negotiation-status",
  Won: "won-status",
};

export function statusClass(status) {
  return STATUS_CLASS[status] || "new-status";
}

// Copy + mock rows for the Leads page, per role. Org Admin/Manager see the
// whole pipeline (with an Owner column); Sales Rep sees only their own leads.
export const LEADS_COPY = {
  [ROLES.ORG_ADMIN]: {
    title: "Leads",
    subtitle: "Every lead across your organization's pipeline.",
    addButtonLabel: "+ Add new lead",
    showOwner: true,
    statCards: [
      { label: "Total Leads", value: "1,284", icon: "◎", color: "blue" },
      { label: "New This Week", value: "62", icon: "▤", color: "purple" },
      { label: "Conversion Rate", value: "18.4%", icon: "%", color: "green" },
    ],
    rows: [
      { name: "John Doe", company: "Acme Inc.", email: "john@acme.com", owner: "Alex Kim", status: "New", value: "$12,500" },
      { name: "Jane Smith", company: "Globex Corp.", email: "jane@globex.com", owner: "Priya Rao", status: "Contacted", value: "$8,200" },
      { name: "Mike Brown", company: "Tech Solutions", email: "mike@techsol.com", owner: "Alex Kim", status: "Proposal", value: "$15,800" },
      { name: "Sara Lee", company: "Initech", email: "sara@initech.com", owner: "Priya Rao", status: "Negotiation", value: "$22,000" },
      { name: "Tom Reed", company: "Umbrella Co.", email: "tom@umbrella.com", owner: "Alex Kim", status: "Won", value: "$9,750" },
      { name: "Nina Patel", company: "Soylent Corp.", email: "nina@soylent.com", owner: "Priya Rao", status: "New", value: "$6,400" },
      { name: "Chris Diaz", company: "Hooli", email: "chris@hooli.com", owner: "Alex Kim", status: "Contacted", value: "$11,300" },
    ],
  },

  [ROLES.SALES_MANAGER]: {
    title: "Team Leads",
    subtitle: "Every lead currently owned by your team.",
    addButtonLabel: "+ Add new lead",
    showOwner: true,
    statCards: [
      { label: "Team Leads", value: "412", icon: "◎", color: "blue" },
      { label: "New This Week", value: "28", icon: "▤", color: "purple" },
      { label: "Conversion Rate", value: "16.9%", icon: "%", color: "green" },
    ],
    rows: [
      { name: "John Doe", company: "Acme Inc.", email: "john@acme.com", owner: "Alex Kim", status: "New", value: "$12,500" },
      { name: "Jane Smith", company: "Globex Corp.", email: "jane@globex.com", owner: "Priya Rao", status: "Contacted", value: "$8,200" },
      { name: "Mike Brown", company: "Tech Solutions", email: "mike@techsol.com", owner: "Alex Kim", status: "Proposal", value: "$15,800" },
      { name: "Sara Lee", company: "Initech", email: "sara@initech.com", owner: "Priya Rao", status: "Negotiation", value: "$22,000" },
    ],
  },

  [ROLES.SALES_REP]: {
    title: "My Leads",
    subtitle: "Leads currently assigned to you.",
    addButtonLabel: "+ Add new lead",
    showOwner: false,
    statCards: [
      { label: "My Leads", value: "58", icon: "◎", color: "blue" },
      { label: "New This Week", value: "6", icon: "▤", color: "purple" },
      { label: "Conversion Rate", value: "21.2%", icon: "%", color: "green" },
    ],
    rows: [
      { name: "John Doe", company: "Acme Inc.", email: "john@acme.com", status: "New", value: "$12,500" },
      { name: "Jane Smith", company: "Globex Corp.", email: "jane@globex.com", status: "Contacted", value: "$8,200" },
      { name: "Sara Lee", company: "Initech", email: "sara@initech.com", status: "Negotiation", value: "$22,000" },
      { name: "Nina Patel", company: "Soylent Corp.", email: "nina@soylent.com", status: "New", value: "$6,400" },
    ],
  },
};
