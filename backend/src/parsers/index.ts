import { parseCSVBuffer } from './csvParser';
import { parseExcelBuffer } from './excelParser';
import { parseJSONBuffer } from './jsonParser';
import { parseXMLBuffer } from './xmlParser';
import { parsePDFBuffer, PDFParseResult } from './pdfParser';
import { parseTXTBuffer } from './txtParser';
import { StandardLead } from './fieldMapper';

export interface MultiFormatParseResult {
  fileType: string;
  leads: Partial<StandardLead>[];
  message?: string;
  extractedTextSuccess?: boolean;
}

export async function parseLeadFileBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<MultiFormatParseResult> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'csv') {
    return {
      fileType: 'CSV',
      leads: parseCSVBuffer(buffer),
      message: 'CSV file parsed successfully'
    };
  }

  if (ext === 'xlsx' || ext === 'xls') {
    return {
      fileType: ext.toUpperCase(),
      leads: parseExcelBuffer(buffer),
      message: 'Excel spreadsheet parsed successfully'
    };
  }

  if (ext === 'json') {
    return {
      fileType: 'JSON',
      leads: parseJSONBuffer(buffer),
      message: 'JSON file parsed successfully'
    };
  }

  if (ext === 'xml') {
    return {
      fileType: 'XML',
      leads: parseXMLBuffer(buffer),
      message: 'XML document parsed successfully'
    };
  }

  if (ext === 'pdf') {
    const pdfRes: PDFParseResult = await parsePDFBuffer(buffer);
    return {
      fileType: 'PDF',
      leads: pdfRes.leads,
      message: pdfRes.message,
      extractedTextSuccess: pdfRes.extractedTextSuccess
    };
  }

  if (ext === 'txt') {
    return {
      fileType: 'TXT',
      leads: parseTXTBuffer(buffer),
      message: 'Text file parsed successfully'
    };
  }

  // Fallback try: JSON -> CSV -> Excel -> TXT
  try {
    return {
      fileType: 'JSON (Auto)',
      leads: parseJSONBuffer(buffer),
      message: 'Auto-detected JSON structure'
    };
  } catch {
    try {
      return {
        fileType: 'Excel/CSV (Auto)',
        leads: parseExcelBuffer(buffer),
        message: 'Auto-detected spreadsheet structure'
      };
    } catch {
      return {
        fileType: 'TXT (Auto)',
        leads: parseTXTBuffer(buffer),
        message: 'Parsed raw text structure'
      };
    }
  }
}
