const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

export const getCodTolerance = (expectedAmount) =>
  Math.max(roundCurrency(expectedAmount * 0.02), 10);

export const getWeightVariancePercent = (declaredWeight, actualWeight) => {
  if (!declaredWeight || !actualWeight) {
    return 0;
  }

  return (Math.abs(actualWeight - declaredWeight) / declaredWeight) * 100;
};

export const buildSuggestedAction = (ruleType) => {
  const map = {
    COD_MISMATCH: 'Verify COD remittance and raise finance dispute with courier.',
    WEIGHT_MISMATCH: 'Audit dead-weight scan and challenge reweighment evidence.',
    RTO_CHARGE_ON_DELIVERED: 'Reverse incorrect RTO charge on a delivered shipment.',
    OVERDUE_SETTLEMENT: 'Escalate delayed remittance with settlement team.',
    DUPLICATE_SETTLEMENT: 'Block duplicate payout and request batch correction.'
  };

  return map[ruleType] || 'Review shipment and settlement evidence manually.';
};

