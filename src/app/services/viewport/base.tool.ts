import { MouseEventArgs } from "./MouseEventArgs";

export class BaseTool {
  icon = "";

  onAnimationFrame() {}
  onViewportMouseLeave(event: MouseEventArgs) {}
  onViewportMouseDown(event: MouseEventArgs) {}
  onViewportMouseUp(event: MouseEventArgs) {}
  onViewportMouseWheel(event: MouseEventArgs) {}
  onViewportBlur(event: Event) {}

  onWindowBlur(event: Event) {}
  onWindowMouseLeave(event: MouseEventArgs) {}
  onWindowMouseDown(event: MouseEventArgs) {}
  onWindowMouseMove(event: MouseEventArgs) {}
  onWindowMouseUp(event: MouseEventArgs) {}
  onWindowMouseWheel(event: MouseEventArgs) {}
}
