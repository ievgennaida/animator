import { Injectable } from "@angular/core";
import { BaseCommand } from "../base-command";
import { BringToFrontCommand } from "./bring-to-front-command";
import { SendToBottomCommand } from "./send-to-bottom-command";
import { StepBackwardCommand } from "./step-backward-command";
import { StepForwardCommand } from "./step-forward-command";

/**
 * Sub menu with groups
 */
@Injectable({
  providedIn: "root",
})
export class OrderGroupCommand implements BaseCommand {
  constructor(
    private bringToFrontCommand: BringToFrontCommand,
    private stepForwardCommand: StepForwardCommand,
    private stepBackwardCommand: StepBackwardCommand,
    private sendToBottomCommand: SendToBottomCommand
  ) {}
  title = "Order";
  commands: BaseCommand[] = [
    this.bringToFrontCommand,
    this.stepForwardCommand,
    this.stepBackwardCommand,
    this.sendToBottomCommand,
  ];
}
