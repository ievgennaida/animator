import { MouseEventArgs } from "../../models/mouse-event-args";
export class BaseTool {
  icon = "";
  onActivate() {}
  onDeactivate() {}
  onAnimationFrame() {}
  onScroll() {}
  onViewportMouseLeave(event: MouseEventArgs) {}
  onViewportMouseDown(event: MouseEventArgs) {}
  onViewportMouseMove(event: MouseEventArgs) {}
  onViewportMouseUp(event: MouseEventArgs) {}
  onViewportMouseWheel(event: MouseEventArgs) {}
  onViewportBlur(event: Event) {}
  onViewportContextMenu(event: MouseEventArgs) {
    event.stopPropagation();
    event.preventDefault();
  }
  onPlayerMouseOut(event: MouseEventArgs) {}
  onPlayerMouseOver(event: MouseEventArgs) {}
  onWindowBlur(event: Event) {}
  onWindowMouseLeave(event: MouseEventArgs) {}
  onWindowMouseDown(event: MouseEventArgs) {}
  onWindowMouseMove(event: MouseEventArgs) {}
  onWindowMouseUp(event: MouseEventArgs) {}
  onWindowMouseWheel(event: MouseEventArgs) {}
  onWindowKeyDown(event: KeyboardEvent) {}
  onWindowKeyUp(event: KeyboardEvent) {}
}
