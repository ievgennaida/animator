import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { AdornersRenderer } from "src/app/services/viewport/renderers/adorners.renderer";
import { BaseRenderer } from "src/app/services/viewport/renderers/base.renderer";
import { BaseComponent } from '../../base-component';

@Component({
  selector: "app-player-adorners",
  templateUrl: "./player-adorners.component.html",
  styleUrls: ["./player-adorners.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAdornersComponent extends BaseComponent implements OnInit {
  renderers: Array<BaseRenderer> = [];
  constructor(
    private cdRef: ChangeDetectorRef,
    adornersRenderer: AdornersRenderer
  ) {
    super();
    this.renderers = adornersRenderer.renderers;
    cdRef.detach();
  }

  trackElement(index: number) {
    return index;
  }

  ngOnInit(): void {
    this.cdRef.detectChanges();
  }
}
