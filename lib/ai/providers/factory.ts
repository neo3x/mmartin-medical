import { AIProviderType, BaseAIProvider } from './base';
import { OpenAIProvider, createOpenAIProvider } from './openai';
import { ClaudeProvider, createClaudeProvider } from './claude';
import { LMStudioProvider, createLMStudioProvider } from './lmstudio';

export function createAIProvider(
  type: AIProviderType,
  apiKey?: string,
  baseURL?: string,
  model?: string
): BaseAIProvider {
  switch (type) {
    case 'openai':
      return createOpenAIProvider(apiKey, baseURL, model);

    case 'anthropic':
      return createClaudeProvider(apiKey, model);

    case 'lmstudio':
      return createLMStudioProvider(baseURL);

    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export function getDefaultProvider(): BaseAIProvider {
  const providerType = (process.env.AI_PROVIDER || 'openai') as AIProviderType;
  return createAIProvider(providerType);
}

export async function getOptimalProvider(): Promise<BaseAIProvider> {
  const preferredType = process.env.AI_PROVIDER as AIProviderType;

  // Try LMStudio first if it's the preferred provider
  if (preferredType === 'lmstudio') {
    try {
      const lmstudio = createLMStudioProvider();
      const isAvailable = await lmstudio.isAvailable();
      if (isAvailable) return lmstudio;
    } catch {
      console.warn('LMStudio not available, falling back to cloud provider');
    }
  }

  // Fall back to cloud providers
  return getDefaultProvider();
}
