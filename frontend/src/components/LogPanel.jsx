const LogPanel = ({ title, rows, variant }) => (
  <div className="panel log-panel">
    <div className="panel-header">
      <h2>{title}</h2>
      <span>{rows.length} items</span>
    </div>
    <div className="log-list">
      {rows.map((row) => (
        <article key={row._id} className="log-item">
          <div className="log-item__top">
            <strong>{variant === 'jobs' ? row.triggerSource : row.awbNumber}</strong>
            <span
              className={`status-pill status-pill--${
                variant === 'jobs' ? row.status.toLowerCase() : row.status
              }`}
            >
              {variant === 'jobs' ? row.status : row.status.toUpperCase()}
            </span>
          </div>
          {variant === 'jobs' ? (
            <>
              <p>{new Date(row.runTime).toLocaleString()}</p>
              <p>
                Processed {row.processedCount} | Matched {row.matchedCount} | Discrepancies{' '}
                {row.discrepancyCount}
              </p>
            </>
          ) : (
            <>
              <p>{row.discrepancyType}</p>
              <p>{new Date(row.timestamp).toLocaleString()}</p>
            </>
          )}
        </article>
      ))}
      {rows.length === 0 ? <p className="empty-state">No logs yet.</p> : null}
    </div>
  </div>
);

export default LogPanel;

