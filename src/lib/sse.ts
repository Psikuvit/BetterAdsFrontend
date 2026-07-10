import { API_BASE_URL } from "./config";
import { getAccessToken } from "./tokens";

export interface AdStatusEvent {
  adId: number;
  status: string;
}

/**
 * Native EventSource can't send an Authorization header, and the backend
 * requires one, so this streams the SSE response manually via fetch.
 */
export function subscribeAdEvents(
  adId: number,
  onEvent: (event: AdStatusEvent) => void,
  onError?: (err: unknown) => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/ads/${adId}/events`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE connection failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (!controller.signal.aborted) {
            onError?.(new Error("SSE stream closed"));
          }
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        let sepIndex: number;
        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);

          const dataLines = rawEvent
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim());

          if (dataLines.length > 0) {
            try {
              const payload = JSON.parse(dataLines.join(""));
              onEvent(payload as AdStatusEvent);
            } catch {
              // ignore malformed payloads
            }
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        onError?.(err);
      }
    }
  })();

  return () => controller.abort();
}
