import React from "react";
import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        <div className="auth-logo">
          <h2>Mini CRM</h2>
        </div>

        <div className="auth-hero-content">
          <h1>
            {title}
          </h1>
          <p>
            {subtitle}
          </p>
          <div className="auth-dashboard">
            <img src={dashboard} alt="CRM Dashboard" />
          </div>
        </div>

        <div className="auth-trusted-teams">
          <div className="auth-avatars">
            <img src={avatar1} alt="Team member" />
            <img src={avatar2} alt="Team member" />
            <img src={avatar3} alt="Team member" />
            <img src={avatar4} alt="Team member" />
          </div>
          <div className="auth-team-text">
            <h3>Trusted by 2,000+ Teams</h3>
            <p>Helping businesses increase productivity every day.</p>
          </div>
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
