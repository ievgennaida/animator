import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from "@angular/core";
import { BaseRenderer } from "src/app/services/renderers/base.renderer";
import { BaseComponent } from 'src/app/components/base-component';

@Component({
  selector: "app-player-adorner",
  templateUrl: "./player-adorner.component.html",
  styleUrls: ["./player-adorner.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAdornerComponent extends BaseComponent implements OnInit {
  @Input() renderer: BaseRenderer | null = null;

  @ViewChild("canvas", { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  constructor(private cdRef: ChangeDetectorRef) {
    super();
    cdRef.detach();
  }
  ngOnInit(): void {
    if (this.renderer) {
      this.renderer.setCanvas(this.canvas.nativeElement);
    }
    this.cdRef.detectChanges();
  }
}
