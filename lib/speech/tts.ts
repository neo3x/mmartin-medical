import { createOpenAIProvider } from '../ai/providers/openai';

export interface SynthesisOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

export async function synthesizeSpeech(
  text: string,
  options?: SynthesisOptions
): Promise<Buffer> {
  try {
    const provider = createOpenAIProvider();
    return await provider.synthesize(text, options);
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw new Error('Failed to synthesize speech');
  }
}

export async function synthesizeSpeechToBase64(
  text: string,
  options?: SynthesisOptions
): Promise<string> {
  const buffer = await synthesizeSpeech(text, options);
  return buffer.toString('base64');
}
