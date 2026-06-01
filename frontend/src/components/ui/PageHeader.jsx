import React from "react";

const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
  meta,
}) => {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <span className="page-header-eyebrow">{eyebrow}</span> : null}
        <div>
          <h1 className="page-header-title">{title}</h1>
          {description ? <p className="page-header-description">{description}</p> : null}
        </div>
      </div>
      {(meta || action) ? (
        <div className="page-header-actions">
          {meta ? <div className="page-header-meta">{meta}</div> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
};

export default PageHeader;
