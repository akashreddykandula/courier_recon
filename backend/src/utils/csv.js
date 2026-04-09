import { parse } from 'csv-parse/sync';

export const parseCsvBuffer = (buffer) =>
  parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

