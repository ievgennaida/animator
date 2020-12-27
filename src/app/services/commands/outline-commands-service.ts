import { Injectable } from "@angular/core";
import { BaseCommand } from "./base-command";
import { CollapseAllCommand } from "./collapse-all-command";
import { ExpandAllCommand } from "./expand-all-command";
import { StepBackwardCommand } from "./order-commands/step-backward-command";
import { StepForwardCommand } from "./order-commands/step-forward-command";
import { ScrollToSelected } from "./scroll-to-selected";
import { SeparatorCommand } from "./separator-command";

/**
 * Handle current active tool and services.
 */
@Injectable({
  providedIn: "root",
})
export class OutlineCommandsService {
  constructor(
    private stepForwardCommand: StepForwardCommand,
    private stepBackwardCommand: StepBackwardCommand,
    private expandAllCommand: ExpandAllCommand,
    private collapseAllCommand: CollapseAllCommand,
    private separatorCommand: SeparatorCommand,
    public scrollToSelectedCommand: ScrollToSelected
  ) {}
  getCommands(): BaseCommand[] {
    return [
      this.stepForwardCommand,
      this.stepBackwardCommand,
      this.separatorCommand,
      this.expandAllCommand,
      this.collapseAllCommand,
      this.scrollToSelectedCommand,
    ];
  }
}
