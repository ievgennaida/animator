import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from "@angular/core";
import { BaseRenderer } from "src/app/services/viewport/renderers/base.renderer";

@Component({
  selector: "app-player-adorner",
  templateUrl: "./player-adorner.component.html",
  styleUrls: ["./player-adorner.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAdornerComponent implements OnInit {
  @Input() renderer: BaseRenderer;
  constructor(cdRef: ChangeDetectorRef) {
  }
  @ViewChild("canvas", { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  ngOnInit(): void {
    if (this.renderer) {
      this.renderer.setCanvas(this.canvas.nativeElement);
    }
  }
}
