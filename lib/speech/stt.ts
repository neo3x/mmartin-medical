import { createOpenAIProvider } from '../ai/providers/openai';

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
}

export async function transcribeAudio(
  audioBuffer: Buffer | File,
  options?: TranscriptionOptions
): Promise<string> {
  try {
    const provider = createOpenAIProvider();
    // Type assertion needed due to OpenAI SDK accepting both File and Buffer
    return await provider.transcribe(audioBuffer as File | Buffer, options);
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function transcribeAudioStream(
  audioBlob: Blob
): Promise<string> {
  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  return transcribeAudio(buffer, { language: 'es' });
}
