/**
 * Asynchronous API client simulator.
 * Ensures all services communicate via real Promise-based asynchronous boundaries,
 * keeping UI completely decoupled from data access, storage, and mock details.
 */

export interface ApiClientOptions {
  simulatedDelayMs?: number
  failureRate?: number // 0.0 to 1.0 (default 0)
}

export class ApiClient {
  private defaultDelay: number

  constructor(defaultDelay = 180) {
    this.defaultDelay = defaultDelay
  }

  /**
   * Simulates an asynchronous HTTP fetch call.
   */
  public async execute<T>(
    operation: () => T | Promise<T>,
    options?: ApiClientOptions
  ): Promise<T> {
    const delay = options?.simulatedDelayMs ?? this.defaultDelay

    // Simulate network transit time
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Optional error simulation for testing error states
    if (options?.failureRate && Math.random() < options.failureRate) {
      throw new Error('Simulated network failure: Server responded with HTTP 500')
    }

    try {
      const result = await operation()
      return result
    } catch (error) {
      console.error('[ApiClient] Service error:', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}

export const apiClient = new ApiClient(150)
