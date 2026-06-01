import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorState = ({ title = "Something went wrong", message, action }) => {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertCircle size={22} />
      </div>
      <div className="error-state-copy">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
      {action ? <div className="error-state-action">{action}</div> : null}
    </div>
  );
};

export default ErrorState;
