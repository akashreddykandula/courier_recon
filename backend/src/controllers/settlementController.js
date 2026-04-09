import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseUploadPayload, persistSettlementBatch } from '../services/uploadService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 2 }
});

export const uploadMiddleware = upload.single('file');

export const uploadSettlements = asyncHandler(async (req, res) => {
  const rows = parseUploadPayload({ file: req.file, body: req.body });
  const result = await persistSettlementBatch(rows);

  res.status(201).json({
    success: true,
    message: 'Settlement batch uploaded successfully.',
    data: result
  });
});

