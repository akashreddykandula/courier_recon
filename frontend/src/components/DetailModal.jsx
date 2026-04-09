const DetailModal = ({ record, onClose }) => {
  if (!record) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h2>{record.awbNumber}</h2>
            <p>{record.merchantId}</p>
          </div>
          <button type="button" className="link-button" onClick={onClose}>
            Close
          </button>
        </div>

        <section className="detail-grid">
          <div>
            <h3>Order Snapshot</h3>
            <p>Status: {record.orderId?.orderStatus || 'Unavailable'}</p>
            <p>COD: Rs.{record.orderId?.codAmount ?? 'NA'}</p>
            <p>Weight: {record.orderId?.declaredWeight ?? 'NA'} kg</p>
          </div>
          <div>
            <h3>Settlement Snapshot</h3>
            <p>Settled COD: Rs.{record.settlementId?.settledCodAmount ?? 'NA'}</p>
            <p>Charged Weight: {record.settlementId?.chargedWeight ?? 'NA'} kg</p>
            <p>Batch: {record.settlementId?.batchId || 'NA'}</p>
          </div>
        </section>

        <section>
          <h3>Discrepancy Details</h3>
          <div className="detail-list">
            {record.discrepancies.map((item) => (
              <article key={`${record._id}-${item.type}`} className="detail-item">
                <strong>{item.type}</strong>
                <p>{item.message}</p>
                <p>Expected: {String(item.expected)}</p>
                <p>Actual: {String(item.actual)}</p>
                <p>Suggested Action: {item.suggestedAction}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailModal;

