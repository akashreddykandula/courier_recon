import { AppError } from '../utils/AppError.js';
import { parseCsvBuffer } from '../utils/csv.js';
import { sha256 } from '../utils/hash.js';
import { toDateOrNull } from '../utils/date.js';
import { Settlement } from '../models/Settlement.js';

const normalizeSettlementRow = (row) => ({
  awbNumber: String(row.awbNumber || '').trim(),
  settledCodAmount: Number(row.settledCodAmount || 0),
  chargedWeight: Number(row.chargedWeight || 0),
  forwardCharge: Number(row.forwardCharge || 0),
  rtoCharge: Number(row.rtoCharge || 0),
  codHandlingFee: Number(row.codHandlingFee || 0),
  settlementDate: toDateOrNull(row.settlementDate),
  batchId: String(row.batchId || '').trim()
});

const validateRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new AppError('Upload payload is empty.', 400);
  }

  if (rows.length > 1000) {
    throw new AppError('Upload limit exceeded. Maximum 1000 rows allowed.', 400);
  }

  let detectedBatchId = null;

  rows.forEach((row, index) => {
    const record = normalizeSettlementRow(row);

    if (
      !record.awbNumber ||
      !record.batchId ||
      !record.settlementDate ||
      Number.isNaN(record.settledCodAmount) ||
      Number.isNaN(record.chargedWeight) ||
      Number.isNaN(record.forwardCharge) ||
      Number.isNaN(record.rtoCharge) ||
      Number.isNaN(record.codHandlingFee)
    ) {
      throw new AppError(`Invalid settlement row at index ${index}.`, 400, row);
    }

    if (!detectedBatchId) {
      detectedBatchId = record.batchId;
    }

    if (record.batchId !== detectedBatchId) {
      throw new AppError('All uploaded rows must belong to the same batchId.', 400);
    }
  });
};

export const parseUploadPayload = ({ file, body }) => {
  if (file) {
    return parseCsvBuffer(file.buffer);
  }

  if (Array.isArray(body?.rows)) {
    return body.rows;
  }

  if (Array.isArray(body)) {
    return body;
  }

  throw new AppError('Provide a CSV file or JSON rows payload.', 400);
};

export const persistSettlementBatch = async (rows) => {
  validateRows(rows);

  const normalizedRows = rows.map(normalizeSettlementRow);
  const batchHash = sha256(JSON.stringify(normalizedRows));
  const batchId = normalizedRows[0].batchId;

  const existingBatch = await Settlement.findOne({
    $or: [{ batchHash }, { batchId }]
  }).lean();

  if (existingBatch) {
    throw new AppError('This settlement batch has already been processed.', 409, {
      batchId,
      batchHash
    });
  }

  const documents = normalizedRows.map((row) => ({
    ...row,
    batchHash,
    status: 'UPLOADED'
  }));

  const inserted = await Settlement.insertMany(documents, { ordered: true });

  return {
    batchId,
    batchHash,
    insertedCount: inserted.length
  };
};
