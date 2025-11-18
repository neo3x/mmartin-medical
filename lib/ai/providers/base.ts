/**
 * Base AI Provider Interface
 * All AI providers must implement this interface
 */

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  stop?: string[];
}

export interface ChatCompletionResponse {
  content: string;
  role: 'assistant';
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface VisionOptions extends ChatCompletionOptions {
  imageUrl: string;
  detail?: 'low' | 'high' | 'auto';
}

export interface EmbeddingOptions {
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  usage?: {
    totalTokens: number;
  };
}

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected baseURL?: string;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  /**
   * Generate a chat completion
   */
  abstract chat(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Generate a streaming chat completion
   */
  abstract chatStream(
    messages: Message[],
    options?: ChatCompletionOptions
  ): AsyncIterableIterator<StreamChunk>;

  /**
   * Analyze an image with vision capabilities
   */
  abstract vision(
    prompt: string,
    options: VisionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Generate embeddings for text
   */
  abstract embeddings(
    text: string | string[],
    options?: EmbeddingOptions
  ): Promise<EmbeddingResponse | EmbeddingResponse[]>;

  /**
   * Count tokens in text (approximate)
   */
  countTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Validate configuration
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get provider name
   */
  abstract getProviderName(): string;

  /**
   * Get available models
   */
  abstract getAvailableModels(): string[];
}

/**
 * AI Provider Factory
 */
export type AIProviderType = 'openai' | 'anthropic' | 'lmstudio';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}
