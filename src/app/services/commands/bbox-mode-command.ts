import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BaseCommand } from "src/app/services/commands/base-command";
import { AdornersService } from "../adorners-service";
import { ConfigService } from "../config-service";
import { AdornersRenderer } from "../renderers/adorners.renderer";

/**
 * Command that will allow viewport switch adorners manipulation type: visual elements viewport transform or in elements coordinates.
 */
@Injectable({
  providedIn: "root",
})
export class BBoxModeCommand implements BaseCommand {
  changed = new Subject<BaseCommand>();
  tooltip?: string;
  title?: string;
  icon: string | null = null;
  align = "right";
  iconSVG = true;
  constructor(
    private adornersRenderer: AdornersRenderer,
    private adornersService: AdornersService,
    private configService: ConfigService
  ) {
    this.resolveState();
  }
  execute(): void {
    const config = this.configService.get();
    config.showTransformedBBoxes = !config.showTransformedBBoxes;
    this.configService.save();
    this.resolveState();
    this.adornersService.cleanCache();
    this.adornersRenderer.invalidate();
    this.changed.next(this);
  }
  resolveState() {
    const config = this.configService.get();
    if (config.showTransformedBBoxes) {
      this.icon = "crop_16_9-black-18dp-transformed";
      this.tooltip = "Display and manipulate transformed element bboxes";
    } else {
      this.icon = "crop_16_9-black-18dp";
      this.tooltip = "Show only untransformed bboxes";
    }
  }
}
