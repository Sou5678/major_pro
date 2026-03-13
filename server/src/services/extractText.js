import pdf from 'pdf-parse';
import mammoth from 'mammoth';

function normalizeText(input) {
  return String(input || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractTextFromFile(file) {
  const mimetype = String(file.mimetype || '').toLowerCase();
  const originalname = String(file.originalname || '').toLowerCase();

  const isPdf = mimetype === 'application/pdf' || originalname.endsWith('.pdf');
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    originalname.endsWith('.docx');

  if (!isPdf && !isDocx) {
    const err = new Error('Unsupported file type. Please upload a PDF or DOCX resume.');
    err.status = 400;
    throw err;
  }

  if (isPdf) {
    const parsed = await pdf(file.buffer);
    const text = normalizeText(parsed.text);
    if (!text) {
      const err = new Error('Could not extract text from PDF.');
      err.status = 422;
      throw err;
    }
    return text;
  }

  const result = await mammoth.extractRawText({ buffer: file.buffer });
  const text = normalizeText(result.value);
  if (!text) {
    const err = new Error('Could not extract text from DOCX.');
    err.status = 422;
    throw err;
  }
  return text;
}
