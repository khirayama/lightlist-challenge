export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoff: 'linear' | 'exponential';
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delayMs: 1000, backoff: 'exponential' }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === options.maxRetries) {
        break;
      }

      // 遅延時間を計算
      let delay = options.delayMs;
      if (options.backoff === 'exponential') {
        delay = options.delayMs * Math.pow(2, attempt);
      } else if (options.backoff === 'linear') {
        delay = options.delayMs * (attempt + 1);
      }

      // 遅延
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}