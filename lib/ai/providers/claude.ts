import Anthropic from '@anthropic-ai/sdk';
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

export class ClaudeProvider extends BaseAIProvider {
  private client: Anthropic;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel?: string) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
    this.defaultModel = defaultModel || 'claude-3-5-sonnet-20240620';
  }

  getProviderName(): string {
    return 'Anthropic Claude';
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }

  async chat(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 4096,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      system: messages.find((m) => m.role === 'system')?.content,
      temperature: options?.temperature ?? 0.7,
      stop_sequences: options?.stop,
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      role: 'assistant',
      finishReason: response.stop_reason || undefined,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async *chatStream(
    messages: Message[],
    options?: ChatCompletionOptions
  ): AsyncIterableIterator<StreamChunk> {
    const stream = await this.client.messages.stream({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 4096,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      system: messages.find((m) => m.role === 'system')?.content,
      temperature: options?.temperature ?? 0.7,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield {
          content: chunk.delta.text,
          done: false,
        };
      }
    }

    yield { content: '', done: true };
  }

  async vision(
    prompt: string,
    options: VisionOptions
  ): Promise<ChatCompletionResponse> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: options.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: options.imageUrl,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: options.temperature ?? 0.7,
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      role: 'assistant',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async embeddings(): Promise<EmbeddingResponse | EmbeddingResponse[]> {
    throw new Error(
      'Claude does not support embeddings. Use OpenAI or local model.'
    );
  }
}

export function createClaudeProvider(
  apiKey?: string,
  model?: string
): ClaudeProvider {
  const key = apiKey || process.env.ANTHROPIC_API_KEY || '';

  if (!key) {
    throw new Error('Anthropic API key is required');
  }

  return new ClaudeProvider(key, model);
}
