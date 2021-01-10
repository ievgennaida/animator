import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}

  registerIcons() {
    const icons = [
      "crop_square",
      "ink_pen",
      "crop_16_9-black-18dp-transformed",
      "crop_16_9-black-18dp",
      "add-black-18dp",
      "break-path-data-node",
      "clear-black-18dp",
      "connect-segments",
      "line-node",
      "merge-segments",
      "remove-segments",
      "share-black-18dp",
      "smooth-path",
      "symmetrical-handle",
      "unsymmetrical-handle",
      "unsymmetrical-handle",
      "symmetrical-handle",
      "share-black-18dp",
      "navigation_outline",
      "navigation",
      "pan_tool",
      "search",
    ];
    icons.forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          `assets/icons/${icon}.svg`
        )
      );
    });
  }
}
