// Export all utilities
export * from './constants';
export * from './crypto';
export * from './db';
export * from './logger';
export * from './validation';
export * from './storage';
export * from './api-client';
export * from './gamification';

// Common utility functions
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    delay: number;
    backoff?: 'exponential' | 'linear';
  }
): Promise<T> => {
  const { retries, delay, backoff = 'exponential' } = options;
  
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    const nextDelay = backoff === 'exponential' ? delay * 2 : delay;
    await sleep(delay);
    
    return retry(fn, {
      retries: retries - 1,
      delay: nextDelay,
      backoff,
    });
  }
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const pick = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};