import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import * as XLSX from 'xlsx'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// Hard limits. The upload is kept in memory and never written to disk.
const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_UNZIPPED_BYTES = 50 * 1024 * 1024
const MAX_SHEETS = 10
const MAX_ROWS = 5000 // data rows per sheet, header row not counted
const MAX_COLS = 100
const MAX_NAME_LENGTH = 255

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]) // .xlsx is a ZIP archive
const CFB_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) // legacy .xls

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 0, parts: 1 },
}).single('file')

class UploadError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Strips any folder path the browser sent and caps the length; the name is only echoed back as text.
function cleanFileName(name) {
  const base = path.basename(String(name || '').replace(/\\/g, '/')).replace(/[\u0000-\u001f\u007f]/g, '')
  return base.slice(0, MAX_NAME_LENGTH) || 'upload'
}

// The extension picks the expected format; the file's first bytes must agree with it.
// Returns the decoded text for CSV files.
function checkSignature(ext, buf) {
  if (ext === '.xlsx') {
    if (!buf.subarray(0, 4).equals(ZIP_MAGIC)) throw new UploadError(400, 'This file is not a valid .xlsx spreadsheet.')
    checkUnzippedSize(buf)
  } else if (ext === '.xls') {
    if (!buf.subarray(0, 8).equals(CFB_MAGIC)) throw new UploadError(400, 'This file is not a valid .xls spreadsheet.')
  } else if (ext === '.csv') {
    if (buf.includes(0)) throw new UploadError(400, 'This file is not a text CSV file.')
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buf)
    } catch {
      throw new UploadError(400, 'CSV files must be UTF-8 text.')
    }
  } else {
    throw new UploadError(400, 'Only .xlsx, .xls and .csv files are accepted.')
  }
}

// Guards against ZIP bombs: adds up the uncompressed sizes listed in the ZIP's
// central directory before anything is decompressed.
function checkUnzippedSize(buf) {
  const EOCD_SIG = 0x06054b50
  const CEN_SIG = 0x02014b50
  let eocd = -1
  // The end record sits in the last 22 bytes plus up to 64 KB of comment.
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break }
  }
  if (eocd < 0) throw new UploadError(422, 'The spreadsheet could not be read.')

  const entries = buf.readUInt16LE(eocd + 10)
  let offset = buf.readUInt32LE(eocd + 16)
  let total = 0
  for (let n = 0; n < entries; n++) {
    if (offset + 46 > buf.length || buf.readUInt32LE(offset) !== CEN_SIG) {
      throw new UploadError(422, 'The spreadsheet could not be read.')
    }
    total += buf.readUInt32LE(offset + 24)
    if (total > MAX_UNZIPPED_BYTES) {
      throw new UploadError(413, 'The spreadsheet expands to more than 50 MB when unpacked.')
    }
    offset += 46 + buf.readUInt16LE(offset + 28) + buf.readUInt16LE(offset + 30) + buf.readUInt16LE(offset + 32)
  }
}

// Blank headers become "Column N"; repeats become "Name (2)", "Name (3)", ...
function makeHeaders(row) {
  const seen = new Map()
  return row.map((value, i) => {
    const base = String(value ?? '').trim() || `Column ${i + 1}`
    const count = (seen.get(base) || 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base} (${count})`
  })
}

// Rows are returned as arrays of strings, never as objects keyed by header,
// so a header such as "__proto__" is just text.
function readSheet(sheet) {
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '', blankrows: false })
  const rows = grid
    .map(r => r.map(v => String(v ?? '')))
    .filter(r => r.some(v => v.trim() !== ''))
  if (rows.length === 0) return null

  const width = Math.max(...rows.map(r => r.length))
  if (width > MAX_COLS) throw new UploadError(422, `A sheet has more than ${MAX_COLS} columns.`)
  const pad = r => r.concat(Array(width - r.length).fill(''))
  return { headers: makeHeaders(pad(rows[0])), rows: rows.slice(1).map(pad) }
}

// `csvText` is set for CSV files, which are parsed from the decoded UTF-8 text.
function parseWorkbook(buf, csvText) {
  let workbook
  try {
    workbook = XLSX.read(csvText ?? buf, {
      type: csvText == null ? 'buffer' : 'string',
      dense: true,
      // +2 so a sheet one row over the cap is detected instead of silently cut.
      sheetRows: MAX_ROWS + 2,
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      bookVBA: false,
      bookFiles: false,
    })
  } catch {
    throw new UploadError(422, 'The spreadsheet could not be read.')
  }

  if (workbook.SheetNames.length > MAX_SHEETS) {
    throw new UploadError(422, `The workbook has more than ${MAX_SHEETS} sheets.`)
  }

  const sheets = []
  for (const name of workbook.SheetNames) {
    const data = readSheet(workbook.Sheets[name])
    if (!data) continue
    if (data.rows.length > MAX_ROWS) {
      throw new UploadError(422, `Sheet "${name.slice(0, 50)}" has more than ${MAX_ROWS} rows.`)
    }
    sheets.push({ name, ...data })
  }
  if (sheets.length === 0) throw new UploadError(422, 'The spreadsheet has no data.')
  return sheets
}

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: [413, 'The file is larger than 2 MB.'],
  LIMIT_FILE_COUNT: [400, 'Upload one file at a time.'],
  LIMIT_PART_COUNT: [400, 'Upload one file at a time.'],
  LIMIT_FIELD_COUNT: [400, 'Only a file can be uploaded.'],
  LIMIT_UNEXPECTED_FILE: [400, 'The file must be sent in the "file" field.'],
}

router.post('/parse', (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const [status, error] = MULTER_MESSAGES[err.code] || [400, 'The upload could not be processed.']
        return res.status(status).json({ error })
      }
      // Malformed multipart bodies come from busboy as plain errors.
      return res.status(400).json({ error: 'The upload could not be processed.' })
    }
    try {
      if (!req.file) throw new UploadError(400, 'Choose a file to upload.')
      const fileName = cleanFileName(req.file.originalname)
      const ext = path.extname(fileName).toLowerCase()
      const csvText = checkSignature(ext, req.file.buffer)
      const sheets = parseWorkbook(req.file.buffer, csvText)
      res.json({ fileName, sheets })
    } catch (e) {
      if (e instanceof UploadError) return res.status(e.status).json({ error: e.message })
      next(e)
    }
  })
})

export default router
