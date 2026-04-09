import { useState } from 'react';

const sampleJson = `[
  {
    "awbNumber": "AWB2001",
    "settledCodAmount": 1350,
    "chargedWeight": 1.4,
    "forwardCharge": 65,
    "rtoCharge": 0,
    "codHandlingFee": 12,
    "settlementDate": "2026-04-08",
    "batchId": "BATCH-API-001"
  }
]`;

const UploadPanel = ({ onUpload, uploading }) => {
  const [mode, setMode] = useState('csv');
  const [file, setFile] = useState(null);
  const [jsonInput, setJsonInput] = useState(sampleJson);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'csv') {
        if (!file) {
          setError('Choose a CSV file first.');
          return;
        }

        await onUpload({ file });
        setFile(null);
        event.target.reset();
        return;
      }

      const rows = JSON.parse(jsonInput);
      await onUpload({ rows });
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || 'Upload failed');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Settlement Upload</h2>
        <div className="segmented-control">
          <button
            type="button"
            className={mode === 'csv' ? 'active' : ''}
            onClick={() => setMode('csv')}
          >
            CSV
          </button>
          <button
            type="button"
            className={mode === 'json' ? 'active' : ''}
            onClick={() => setMode('json')}
          >
            JSON
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {mode === 'csv' ? (
          <label className="file-dropzone">
            <span>{file ? file.name : 'Choose settlement CSV (max 1000 rows)'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
        ) : (
          <textarea
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={10}
          />
        )}

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Batch'}
        </button>
      </form>
    </div>
  );
};

export default UploadPanel;

