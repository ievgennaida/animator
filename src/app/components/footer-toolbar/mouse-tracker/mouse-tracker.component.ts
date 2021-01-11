import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { MouseEventArgs } from "src/app/models/mouse-event-args";
import { Utils } from "src/app/services/utils/utils";
import { ToolsService } from "src/app/services/tools/tools.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-mouse-tracker",
  templateUrl: "./mouse-tracker.component.html",
  styleUrls: ["./mouse-tracker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MouseTrackerComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  @ViewChild("outputX", { read: ElementRef, static: true })
  outputX: ElementRef<HTMLElement>;
  @ViewChild("outputY", { read: ElementRef, static: true })
  outputY: ElementRef<HTMLElement>;
  constructor(
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private toolsService: ToolsService
  ) {
    super();
    this.cdRef.detach();
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.toolsService.viewportMouseMoveSubject
        .pipe(takeUntil(this.destroyed$))
        .subscribe((event: MouseEventArgs) => {
          if (
            this.outputX &&
            this.outputX.nativeElement &&
            event.viewportPoint &&
            this.outputY &&
            this.outputY.nativeElement
          ) {
            const p = event.viewportPoint;
            this.outputX.nativeElement.innerText = `x: ${Utils.round(p.x)}`;
            this.outputY.nativeElement.innerText = `y: ${Utils.round(p.y)}`;
          }
        });
    });
  }
}
