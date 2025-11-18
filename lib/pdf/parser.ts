import pdf from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractPagesFromPDF(buffer: Buffer) {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text,
      numPages: data.numpages,
      metadata: data.metadata,
      info: data.info,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

export interface PDFAnalysis {
  text: string;
  wordCount: number;
  pageCount: number;
  hasImages: boolean;
  metadata: any;
}

export async function analyzePDF(buffer: Buffer): Promise<PDFAnalysis> {
  const data = await pdf(buffer);

  return {
    text: data.text,
    wordCount: data.text.split(/\s+/).length,
    pageCount: data.numpages,
    hasImages: false, // Would need more complex analysis
    metadata: data.metadata,
  };
}
