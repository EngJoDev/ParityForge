export interface EngineHealthResponse {
  status: 'ok' | 'degraded';
  version: string;
  supportedAdapters: string[];
}

export class EngineClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:8765/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * يفحص بأمانة هل محرك بايثون الحقيقي شغال محلياً على المنفذ 8765
   */
  public async checkHealth(): Promise<{ isConnected: boolean; info?: EngineHealthResponse; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { isConnected: false, error: `Engine returned HTTP ${res.status}` };
      }
      const data = await res.json() as EngineHealthResponse;
      return { isConnected: true, info: data };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Connection refused';
      return { 
        isConnected: false, 
        error: `Engine unreachable at ${this.baseUrl} (${errorMsg}). Demo Mode is active.` 
      };
    }
  }
}