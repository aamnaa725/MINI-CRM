import { useEffect, useState } from "react";

const STATUS_OPTIONS = ["New", "Contacted", "Proposal", "Negotiation", "Won"];

const EMPTY_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  owner: "",
  status: "New",
  value: "",
};

function AddLeadModal({ isOpen, onClose, onSubmit, showOwner }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    setForm(EMPTY_FORM);
    setErrors({});

    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.company.trim()) nextErrors.company = "Company is required";

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const numericValue = Number(form.value.replace(/[^0-9.]/g, "")) || 0;

    onSubmit({
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      owner: form.owner.trim(),
      status: form.status,
      value: `$${numericValue.toLocaleString()}`,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="lead-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="lead-modal-header">
          <h3 id="lead-modal-title">Add New Lead</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <div className="lead-modal-grid">

            <div className="lead-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="lead-field">
              <label>Company</label>
              <input
                type="text"
                name="company"
                placeholder="e.g. Acme Inc."
                value={form.company}
                onChange={handleChange}
              />
              {errors.company && <span className="field-error">{errors.company}</span>}
            </div>

            <div className="lead-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. john@acme.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="lead-field">
              <label>Phone <span className="field-optional">(optional)</span></label>
              <input
                type="text"
                name="phone"
                placeholder="e.g. +1 555 0100"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="lead-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="lead-field">
              <label>Deal Value <span className="field-optional">(optional)</span></label>
              <input
                type="text"
                name="value"
                placeholder="e.g. 12500"
                value={form.value}
                onChange={handleChange}
              />
            </div>

            {showOwner && (
              <div className="lead-field lead-field-full">
                <label>Owner <span className="field-optional">(optional)</span></label>
                <input
                  type="text"
                  name="owner"
                  placeholder="e.g. Alex Kim"
                  value={form.owner}
                  onChange={handleChange}
                />
              </div>
            )}

          </div>

          <div className="lead-modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-lead-btn">
              Add Lead
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default AddLeadModal;
