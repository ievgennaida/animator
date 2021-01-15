import { Injectable } from "@angular/core";
import { BaseCommand } from "../base-command";
import { CollapseAllCommand } from "../collapse-all-command";
import { ExpandAllCommand } from "../expand-all-command";
import { OutlineStepBackwardCommand } from "../order-commands/step-backward-command";
import { OutlineStepForwardCommand } from "../order-commands/step-forward-command";
import { ScrollToSelected } from "../scroll-to-selected";
import { SeparatorCommand } from "../separator-command";

/**
 * Get current outline tree commands list
 */
@Injectable({
  providedIn: "root",
})
export class OutlineCommandsService {
  constructor(
    private outlineStepForwardCommand: OutlineStepForwardCommand,
    private outlineStepBackwardCommand: OutlineStepBackwardCommand,
    private expandAllCommand: ExpandAllCommand,
    private collapseAllCommand: CollapseAllCommand,
    private separatorCommand: SeparatorCommand,
    public scrollToSelectedCommand: ScrollToSelected
  ) {}
  getCommands(): BaseCommand[] {
    return [
      this.outlineStepForwardCommand,
      this.outlineStepBackwardCommand,
      this.separatorCommand,
      this.expandAllCommand,
      this.collapseAllCommand,
      this.scrollToSelectedCommand,
    ];
  }
}
