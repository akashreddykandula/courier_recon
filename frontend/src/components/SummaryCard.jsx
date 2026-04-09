const SummaryCard = ({ label, value, tone }) => (
  <div className={`summary-card summary-card--${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default SummaryCard;

