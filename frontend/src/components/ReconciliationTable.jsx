const ReconciliationTable = ({ rows, onSelect }) => (
  <div className="panel table-panel">
    <div className="panel-header">
      <h2>Reconciliation Results</h2>
      <span>{rows.length} records</span>
    </div>

    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>AWB</th>
            <th>Merchant</th>
            <th>Status</th>
            <th>Discrepancies</th>
            <th>Last Run</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td>{row.awbNumber}</td>
              <td>{row.merchantId}</td>
              <td>
                <span className={`status-pill status-pill--${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </td>
              <td>{row.discrepancyTypes.join(', ') || 'None'}</td>
              <td>{new Date(row.lastRunAt).toLocaleString()}</td>
              <td>
                <button type="button" className="link-button" onClick={() => onSelect(row)}>
                  View
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-state">
                No reconciliation records yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);

export default ReconciliationTable;

