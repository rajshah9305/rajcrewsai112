import { Cerebras } from '@cerebras/cerebras_cloud_sdk';

export class CerebrasClient {
  private client: Cerebras;

  constructor() {
    this.client = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY
    });
  }

  async createCompletion(model: string, messages: Array<{role: 'system' | 'user' | 'assistant', content: string}>, options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
  } = {}) {
    const {
      temperature = 0.2,
      maxTokens = 8192,
      topP = 1,
      stream = false
    } = options;

    try {
      const completion = await this.client.chat.completions.create({
        messages,
        model,
        stream,
        max_completion_tokens: maxTokens,
        temperature,
        top_p: topP
      });

      return completion;
    } catch (error) {
      console.error('Cerebras API error:', error);
      throw new Error('Failed to create completion with Cerebras API');
    }
  }

  async createStreamCompletion(model: string, messages: Array<{role: 'system' | 'user' | 'assistant', content: string}>, options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  } = {}) {
    const {
      temperature = 0.2,
      maxTokens = 8192,
      topP = 1
    } = options;

    try {
      const stream = await this.client.chat.completions.create({
        messages,
        model,
        stream: true,
        max_completion_tokens: maxTokens,
        temperature,
        top_p: topP
      });

      return stream;
    } catch (error) {
      console.error('Cerebras API error:', error);
      throw new Error('Failed to create stream completion with Cerebras API');
    }
  }

  // Helper method to get model-specific configurations
  getModelConfig(model: string) {
    const configs = {
      'llama-3.3-70b': {
        temperature: 0.2,
        top_p: 1,
        max_tokens: 8192
      },
      'llama-4-scout-17b-16e-instruct': {
        temperature: 0.2,
        top_p: 1,
        max_tokens: 8192
      },
      'llama-4-maverick-17b-128e-instruct': {
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 8192
      }
    };

    return configs[model as keyof typeof configs] || configs['llama-3.3-70b'];
  }
}

export const cerebrasClient = new CerebrasClient();