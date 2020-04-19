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
