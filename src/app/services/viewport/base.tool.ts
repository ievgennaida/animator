import { MouseEventArgs } from "./MouseEventArgs";

export class BaseTool {
  icon = "";

  onAnimationFrame() {}
  onViewportMouseLeave(event: MouseEventArgs) {}
  onViewportMouseDown(event: MouseEventArgs) {}
  onViewportMouseMove(event: MouseEventArgs) {}
  onViewportMouseUp(event: MouseEventArgs) {}
  onViewportMouseWheel(event: MouseEventArgs) {}
  onViewportBlur(event: Event) {}
  onPlayerMouseOut(event: MouseEventArgs){}
  onPlayerMouseOver(event: MouseEventArgs){}
  onWindowBlur(event: Event) {}
  onWindowMouseLeave(event: MouseEventArgs) {}
  onWindowMouseDown(event: MouseEventArgs) {}
  onWindowMouseMove(event: MouseEventArgs) {}
  onWindowMouseUp(event: MouseEventArgs) {}
  onWindowMouseWheel(event: MouseEventArgs) {}
}
