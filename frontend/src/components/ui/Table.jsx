import React from "react";
import EmptyState from "./EmptyState";

const Table = ({
  headers = [],
  children,
  className = "",
  isEmpty = false,
  emptyMessage = "No items found.",
  emptyTitle = "Nothing to show",
  emptyIcon,
  emptyAction,
  isLoading = false,
  skeletonRows = 5,
}) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="th" style={header.style}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {headers.map((_, cIdx) => (
                  <td key={cIdx} className="td">
                    <div className="skeleton skeleton-text" style={{ width: cIdx === 0 ? "40%" : "70%", height: "18px", margin: 0 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="td" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description={emptyMessage}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
