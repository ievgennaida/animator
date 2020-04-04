import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { AdornersRenderer } from "src/app/services/viewport/renderers/adorners.renderer";
import { BaseRenderer } from 'src/app/services/viewport/renderers/base.renderer';

@Component({
  selector: "app-player-adorners",
  templateUrl: "./player-adorners.component.html",
  styleUrls: ["./player-adorners.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAdornersComponent implements OnInit {
  renderers: Array<BaseRenderer> = [];
  constructor(
    cdRef: ChangeDetectorRef,
    adornersRenderer: AdornersRenderer
  ) {
    this.renderers = adornersRenderer.renderers;
  }

  trackElement(index: number) {
    return index;
  }

  ngOnInit(): void {

  }
}
