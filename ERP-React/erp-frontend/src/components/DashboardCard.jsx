import React from "react";
import "./DashboardCard.css";

export default function DashboardCard({
  title,
  value,
  icon: Icon
}) {
  return (
    <div className="dashboard-card">

      <div className="dashboard-card-content">
        <p className="dashboard-card-title">
          {title}
        </p>

        <h2 className="dashboard-card-value">
          {value}
        </h2>
      </div>

      <div className="dashboard-card-icon">
        {Icon && <Icon />}
      </div>

    </div>
  );
}