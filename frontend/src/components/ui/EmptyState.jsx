import React from "react";

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="empty-state">
      {Icon ? (
        <div className="empty-state-icon">
          <Icon size={24} />
        </div>
      ) : null}
      <div className="empty-state-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
