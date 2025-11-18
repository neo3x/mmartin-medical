import {
  BaseAIProvider,
  Message,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamChunk,
  VisionOptions,
  EmbeddingOptions,
  EmbeddingResponse,
} from './base';

export class LMStudioProvider extends BaseAIProvider {
  private baseURL: string;

  constructor(baseURL?: string) {
    super('not-needed', baseURL || 'http://localhost:1234/v1');
    this.baseURL = this.baseURL || 'http://localhost:1234/v1';
  }

  getProviderName(): string {
    return 'LMStudio (Local)';
  }

  getAvailableModels(): string[] {
    return ['local-model'];
  }

  async chat(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LMStudio error: ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      role: 'assistant',
      finishReason: choice.finish_reason,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *chatStream(
    messages: Message[],
    options?: ChatCompletionOptions
  ): AsyncIterableIterator<StreamChunk> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`LMStudio error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No reader available');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            yield { content, done: false };
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async vision(): Promise<ChatCompletionResponse> {
    throw new Error('LMStudio does not support vision by default');
  }

  async embeddings(
    text: string | string[],
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse | EmbeddingResponse[]> {
    const input = Array.isArray(text) ? text : [text];

    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        input,
      }),
    });

    if (!response.ok) {
      throw new Error(`LMStudio error: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.data.map((item: any) => ({
      embedding: item.embedding,
      usage: { totalTokens: data.usage?.total_tokens || 0 },
    }));

    return Array.isArray(text) ? results : results[0];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createLMStudioProvider(baseURL?: string): LMStudioProvider {
  const url = baseURL || process.env.LMSTUDIO_API_URL;
  return new LMStudioProvider(url);
}
