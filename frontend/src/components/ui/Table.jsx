import React from "react";

const Table = ({
  headers = [],
  children,
  className = "",
  isEmpty = false,
  emptyMessage = "No items found.",
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
                {emptyMessage}
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
