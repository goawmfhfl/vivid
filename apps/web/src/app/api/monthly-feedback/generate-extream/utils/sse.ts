import type { MonthlyFeedback } from "@/types/monthly-feedback";

/**
 * SSE 스트림 헬퍼 클래스
 */
export class SSEStreamHelper {
  private encoder = new TextEncoder();
  private isClosed = false;

  constructor(
    private controller: ReadableStreamDefaultController<Uint8Array>
  ) {}

  /**
   * 진행 상황 전송
   */
  sendProgress(step: number, total: number, sectionName: string): void {
    if (this.isClosed) {
      return;
    }
    try {
      const data = JSON.stringify({
        type: "progress",
        current: step,
        total,
        sectionName,
      });
      this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`));
    } catch (error) {
      this.isClosed = true;
      console.warn("Cannot send progress: controller is closed");
    }
  }

  /**
   * 완료 메시지 전송
   */
  sendComplete(data: MonthlyFeedback & { id: string }): void {
    if (this.isClosed) return;
    this.isClosed = true;
    const result = JSON.stringify({
      type: "complete",
      data,
    });
    this.controller.enqueue(this.encoder.encode(`data: ${result}\n\n`));
    this.controller.close();
  }

  /**
   * 에러 메시지 전송
   */
  sendError(error: string): void {
    if (this.isClosed) return;
    this.isClosed = true;
    const data = JSON.stringify({
      type: "error",
      error,
    });
    this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`));
    this.controller.close();
  }

  /**
   * 스트림 닫기
   */
  close(): void {
    if (!this.isClosed) {
      this.isClosed = true;
      this.controller.close();
    }
  }
}
