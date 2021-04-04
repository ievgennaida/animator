import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { OutlineService } from "../outline.service";
import { BaseCommand } from "./base-command";

/**
 * Cut command
 */
@Injectable({
  providedIn: "root",
})
export class ScrollToSelected implements BaseCommand {

  executed = new Subject<BaseCommand>();
  tooltip = "Scroll To Selected";
  title = "Scroll To Selected";
  icon = "anchor";
  hotkey = "";
  iconSVG = false;
  constructor() {}
  execute(): void {
    this.executed.next(this);
  }
}
