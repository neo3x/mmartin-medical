import OpenAI from 'openai';
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

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, baseURL?: string, defaultModel?: string) {
    super(apiKey, baseURL);
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
    this.defaultModel = defaultModel || 'gpt-4-turbo-preview';
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4-turbo-preview',
      'gpt-4-1106-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
  }

  async chat(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        name: m.name,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      stop: options?.stop,
      stream: false,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      role: 'assistant',
      finishReason: choice.finish_reason || undefined,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *chatStream(
    messages: Message[],
    options?: ChatCompletionOptions
  ): AsyncIterableIterator<StreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        name: m.name,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      stop: options?.stop,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      const done = chunk.choices[0]?.finish_reason !== null;

      yield {
        content,
        done,
      };
    }
  }

  async vision(
    prompt: string,
    options: VisionOptions
  ): Promise<ChatCompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: options.imageUrl,
                detail: options.detail || 'auto',
              },
            },
          ],
        },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      role: 'assistant',
      finishReason: choice.finish_reason || undefined,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  async embeddings(
    text: string | string[],
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse | EmbeddingResponse[]> {
    const input = Array.isArray(text) ? text : [text];

    const response = await this.client.embeddings.create({
      model: options?.model || 'text-embedding-3-small',
      input,
    });

    const results = response.data.map((item) => ({
      embedding: item.embedding,
      usage: {
        totalTokens: response.usage?.total_tokens || 0,
      },
    }));

    return Array.isArray(text) ? results : results[0];
  }

  /**
   * Speech-to-Text (Whisper)
   */
  async transcribe(
    audioFile: File | Buffer,
    options?: {
      language?: string;
      prompt?: string;
    }
  ): Promise<string> {
    const response = await this.client.audio.transcriptions.create({
      // Type assertion needed due to OpenAI SDK accepting both File and Buffer
      file: audioFile as File | Buffer,
      model: 'whisper-1',
      language: options?.language,
      prompt: options?.prompt,
    });

    return response.text;
  }

  /**
   * Text-to-Speech
   */
  async synthesize(
    text: string,
    options?: {
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      speed?: number;
    }
  ): Promise<Buffer> {
    const response = await this.client.audio.speech.create({
      model: 'tts-1',
      voice: options?.voice || 'alloy',
      input: text,
      speed: options?.speed || 1.0,
    });

    return Buffer.from(await response.arrayBuffer());
  }
}

/**
 * Create OpenAI provider instance
 */
export function createOpenAIProvider(
  apiKey?: string,
  baseURL?: string,
  model?: string
): OpenAIProvider {
  const key = apiKey || process.env.OPENAI_API_KEY || '';

  if (!key) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAIProvider(key, baseURL, model);
}
