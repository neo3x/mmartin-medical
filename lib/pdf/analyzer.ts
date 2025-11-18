import { getDefaultProvider } from '../ai/providers/factory';
import { getSystemPrompt, buildContextualPrompt } from '../ai/prompts';
import { extractTextFromPDF } from './parser';

export interface UserContext {
  age?: number;
  gender?: string;
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
}

export interface ExamAnalysis {
  rawText: string;
  interpretation: string;
  summary: string;
  findings: Array<{
    parameter: string;
    value: string;
    normalRange?: string;
    status: 'normal' | 'abnormal' | 'critical';
  }>;
  recommendations: string[];
  criticalValues: string[];
  metadata: {
    analyzedAt: string;
    provider: string;
  };
}

export async function analyzeMedicalExam(
  pdfBuffer: Buffer,
  userContext?: UserContext
): Promise<ExamAnalysis> {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(pdfBuffer);

    if (!text || text.trim().length < 50) {
      throw new Error('PDF appears to be empty or has insufficient text');
    }

    // Get AI provider
    const provider = getDefaultProvider();

    // Build system prompt
    const systemPrompt =
      getSystemPrompt('exam_interpreter') +
      buildContextualPrompt(userContext || {});

    // Analyze with AI
    const response = await provider.chat(
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Por favor analiza el siguiente resultado de examen médico:\n\n${text}`,
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 2048,
      }
    );

    // Parse critical values
    const criticalValues = extractCriticalValues(text, response.content);

    // Extract findings
    const findings = extractFindings(text);

    // Extract recommendations
    const recommendations = extractRecommendations(response.content);

    return {
      rawText: text,
      interpretation: response.content,
      summary: extractSummary(response.content),
      findings,
      recommendations,
      criticalValues,
      metadata: {
        analyzedAt: new Date().toISOString(),
        provider: provider.getProviderName(),
      },
    };
  } catch (error) {
    console.error('Exam analysis error:', error);
    throw error;
  }
}

function extractSummary(interpretation: string): string {
  const match = interpretation.match(/##\s*Resumen\s*\n(.*?)(?=\n##|$)/is);
  return match ? match[1].trim() : interpretation.substring(0, 200) + '...';
}

function extractCriticalValues(text: string, interpretation: string): string[] {
  const critical: string[] = [];

  // Look for critical markers in interpretation
  const criticalSection = interpretation.match(
    /##\s*Valores?\s*Cr[ií]ticos?\s*.*?\n(.*?)(?=\n##|$)/is
  );
  if (criticalSection) {
    const lines = criticalSection[1].split('\n').filter((l) => l.trim());
    critical.push(...lines);
  }

  return critical;
}

function extractFindings(text: string): ExamAnalysis['findings'] {
  const findings: ExamAnalysis['findings'] = [];

  // Simple pattern matching for common lab values
  const patterns = [
    /(?:hemoglobina|hb):\s*([\d.]+)/i,
    /(?:glucosa|glucose):\s*([\d.]+)/i,
    /(?:colesterol|cholesterol):\s*([\d.]+)/i,
    /(?:triglicéridos|triglycerides):\s*([\d.]+)/i,
  ];

  patterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match) {
      findings.push({
        parameter: match[0].split(':')[0].trim(),
        value: match[1],
        status: 'normal', // Would need more sophisticated logic
      });
    }
  });

  return findings;
}

function extractRecommendations(interpretation: string): string[] {
  const recommendations: string[] = [];

  const recSection = interpretation.match(
    /##\s*Recomendaciones?\s*\n(.*?)(?=\n##|$)/is
  );
  if (recSection) {
    const lines = recSection[1]
      .split('\n')
      .filter((l) => l.trim() && (l.match(/^\d+\./) || l.match(/^[-*]/)));
    recommendations.push(...lines.map((l) => l.replace(/^[-*\d.]+\s*/, '')));
  }

  return recommendations;
}

export async function compareExams(
  currentExam: ExamAnalysis,
  previousExams: ExamAnalysis[]
): Promise<string> {
  const provider = getDefaultProvider();

  const comparisonPrompt = `Compara los siguientes resultados de exámenes médicos e identifica tendencias:

EXAMEN ACTUAL:
${currentExam.interpretation}

EXÁMENES ANTERIORES:
${previousExams.map((e, i) => `\nExamen ${i + 1} (${e.metadata.analyzedAt}):\n${e.interpretation}`).join('\n---\n')}

Proporciona:
1. Tendencias observadas
2. Mejoras o deterioros
3. Valores que requieren atención
4. Recomendaciones basadas en la evolución`;

  const response = await provider.chat(
    [{ role: 'user', content: comparisonPrompt }],
    {
      temperature: 0.3,
      maxTokens: 1024,
    }
  );

  return response.content;
}
