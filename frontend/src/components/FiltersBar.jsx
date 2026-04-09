const FiltersBar = ({ filters, onChange, onRun, running }) => (
  <div className="panel filters-bar">
    <div className="filters-grid">
      <label>
        <span>Status</span>
        <select value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
          <option value="ALL">All</option>
          <option value="MATCHED">Matched</option>
          <option value="DISCREPANCY">Discrepancy</option>
          <option value="PENDING_REVIEW">Pending Review</option>
        </select>
      </label>

      <label>
        <span>Merchant</span>
        <input
          value={filters.merchantId}
          onChange={(event) => onChange('merchantId', event.target.value)}
          placeholder="M001"
        />
      </label>

      <label>
        <span>AWB Search</span>
        <input
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Search AWB"
        />
      </label>
    </div>

    <button className="secondary-button" type="button" onClick={onRun} disabled={running}>
      {running ? 'Running...' : 'Run Reconciliation'}
    </button>
  </div>
);

export default FiltersBar;

