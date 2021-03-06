import { Injectable } from "@angular/core";
import { BaseCommand } from "src/app/services/commands/base-command";
import { AdornersService } from "../adorners-service";
import { SelectionService } from "../selection.service";
import { AdornersRenderer } from "../renderers/adorners.renderer";
import { TransformsService } from "../tools/transforms.service";

/**
 * Command to remove matrix transform.
 * Untransform matrix and preserve position of all path data points.
 */
@Injectable({
  providedIn: "root",
})
export class UntransformCommand implements BaseCommand {
  active = false;
  tooltip = "Untransform matrix and preserve position of all path data points.";
  title = "Untransform";
  icon = "crop_16_9-black-18dp";
  align = "right";
  iconSVG = true;
  constructor(
    private selectionService: SelectionService,
    private transformService: TransformsService,
    private adornersRenderer: AdornersRenderer,
    private adornersService: AdornersService
  ) {}
  canExecute(): boolean {
    const nodes = this.selectionService.getSelected();
    return nodes && nodes.length > 0;
  }
  execute(): void {
    // TODO: extract action for the undo/redo service.
    const nodes = this.selectionService.getSelected();
    if (nodes && nodes.length > 0) {
      /* const transformations = nodes.map((p) =>
        this.transformService.getTransform(p)
      );

      transformations.forEach((p) => {
        p.untransform();
        p.node.cleanCache();
      });
      this.adornersService.cleanCache();
      this.adornersRenderer.invalidate();*/
    }
  }
}
