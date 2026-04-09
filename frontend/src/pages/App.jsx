import { useEffect, useState } from 'react';
import {
  fetchDashboard,
  fetchReconciliations,
  runReconciliation,
  uploadSettlements
} from '../api/reconciliation';
import SummaryCard from '../components/SummaryCard';
import UploadPanel from '../components/UploadPanel';
import FiltersBar from '../components/FiltersBar';
import ReconciliationTable from '../components/ReconciliationTable';
import DetailModal from '../components/DetailModal';
import LogPanel from '../components/LogPanel';

const App = () => {
  const [dashboard, setDashboard] = useState({
    counts: { matched: 0, discrepancy: 0, pendingReview: 0 },
    jobs: [],
    notifications: []
  });
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ status: 'ALL', merchantId: '', search: '' });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const [banner, setBanner] = useState('');

  const loadData = async (nextFilters = filters) => {
    const [dashboardData, reconciliationData] = await Promise.all([
      fetchDashboard(),
      fetchReconciliations(nextFilters)
    ]);

    setDashboard(dashboardData);
    setRows(reconciliationData);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadData();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timeout = setTimeout(() => {
      loadData(filters).catch(() => null);
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleUpload = async ({ file, rows: jsonRows }) => {
    setUploading(true);
    setBanner('');

    try {
      const response = await uploadSettlements({ file, rows: jsonRows });
      setBanner(`Uploaded batch ${response.batchId} with ${response.insertedCount} rows.`);
      await loadData();
    } finally {
      setUploading(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setBanner('');

    try {
      const result = await runReconciliation();
      setBanner(
        `Run completed at ${new Date(result.runTime).toLocaleString()} with ${result.discrepancyCount} discrepancies.`
      );
      await loadData();
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <main className="app-shell">Loading dashboard...</main>;
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Courier Settlement Reconciliation & Alert Engine</p>
          <h1>Operations-grade visibility for COD settlement disputes.</h1>
          <p className="hero-copy">
            Upload settlement batches, run rule-based reconciliation, and stream courier
            discrepancies through a queue-backed notification pipeline.
          </p>
        </div>
      </header>

      {banner ? <div className="banner">{banner}</div> : null}

      <section className="summary-grid">
        <SummaryCard label="Matched" value={dashboard.counts.matched} tone="matched" />
        <SummaryCard
          label="Discrepancies"
          value={dashboard.counts.discrepancy}
          tone="discrepancy"
        />
        <SummaryCard
          label="Pending Review"
          value={dashboard.counts.pendingReview}
          tone="pending"
        />
      </section>

      <section className="layout-grid">
        <UploadPanel onUpload={handleUpload} uploading={uploading} />
        <div className="stack">
          <FiltersBar
            filters={filters}
            onChange={handleFilterChange}
            onRun={handleRun}
            running={running}
          />
          <ReconciliationTable rows={rows} onSelect={setSelectedRecord} />
        </div>
      </section>

      <section className="log-grid">
        <LogPanel title="Job Logs" rows={dashboard.jobs} variant="jobs" />
        <LogPanel title="Notification Logs" rows={dashboard.notifications} variant="notifications" />
      </section>

      <DetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </main>
  );
};

export default App;

