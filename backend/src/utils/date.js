export const daysBetween = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return null;
  }

  const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const toDateOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

