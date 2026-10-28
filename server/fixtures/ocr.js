// What the simulated OCR "reads" from each sample ID card in
// src/testresources/ocr/. Keyed by file name; the server matches uploads by
// the file's sha256, so the images must not be edited.
// Confidence is 0–1; the page flags fields below 0.8 for the user to check.
export const OCR_FIXTURES = {
  'id-clean.png': {
    documentType: 'Sample ID card',
    fields: [
      { key: 'fullName',    value: 'Layla Haddad', confidence: 0.98 },
      { key: 'idNumber',    value: 'PG-4821-7730', confidence: 0.99 },
      { key: 'dateOfBirth', value: '1994-03-12',   confidence: 0.97 },
      { key: 'city',        value: 'Amman',        confidence: 0.96 },
      { key: 'expiryDate',  value: '2031-08-30',   confidence: 0.98 },
    ],
  },
  // Blurred photo: lower confidence everywhere, and the ID number is misread
  // (a zero read as the letter O), so a test can practise correcting it.
  'id-blurry.png': {
    documentType: 'Sample ID card',
    fields: [
      { key: 'fullName',    value: 'Arjun Rao',    confidence: 0.71 },
      { key: 'idNumber',    value: 'PG-5O93-1182', confidence: 0.58 },
      { key: 'dateOfBirth', value: '1988-11-05',   confidence: 0.66 },
      { key: 'city',        value: 'Bengaluru',    confidence: 0.82 },
      { key: 'expiryDate',  value: '2029-02-14',   confidence: 0.62 },
    ],
  },
  // A sticker hides the expiry date, so it comes back empty.
  'id-partial.png': {
    documentType: 'Sample ID card',
    fields: [
      { key: 'fullName',    value: 'Mei Tanaka',   confidence: 0.97 },
      { key: 'idNumber',    value: 'PG-3307-6419', confidence: 0.96 },
      { key: 'dateOfBirth', value: '1991-07-23',   confidence: 0.95 },
      { key: 'city',        value: 'Osaka',        confidence: 0.93 },
      { key: 'expiryDate',  value: '',             confidence: 0 },
    ],
  },
}
