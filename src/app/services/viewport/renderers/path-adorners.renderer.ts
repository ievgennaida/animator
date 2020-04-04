import { Injectable } from "@angular/core";
import { LoggerService } from "../../logger.service";
import { ViewService } from "../../view.service";
import { BaseRenderer } from "./base.renderer";

@Injectable({
  providedIn: "root",
})
export class PathRenderer extends BaseRenderer {
  constructor(
    protected viewService: ViewService,
    protected logger: LoggerService
  ) {
    super();
  }

  redraw() {
    this.invalidated = false;
    this.clear();
  }
}
