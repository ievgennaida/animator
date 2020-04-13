import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  OnDestroy,
  NgZone,
} from "@angular/core";
import { Subject } from "rxjs";
import { ToolsService } from "src/app/services/viewport/tools.service";
import { takeUntil } from "rxjs/operators";
import { MouseEventArgs } from "src/app/services/viewport/mouse-event-args";
import { Utils } from "src/app/services/utils/utils";

@Component({
  selector: "app-mouse-tracker",
  templateUrl: "./mouse-tracker.component.html",
  styleUrls: ["./mouse-tracker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MouseTrackerComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  @ViewChild("outputX", { read: ElementRef })
  outputX: ElementRef<HTMLElement>;
  @ViewChild("outputY", { read: ElementRef })
  outputY: ElementRef<HTMLElement>;
  constructor(private ngZone: NgZone, private toolsService: ToolsService) {}

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
            this.outputX.nativeElement.innerText = `x: ${Utils.RoundTwo(
              event.viewportPoint.x
            )}`;
            this.outputY.nativeElement.innerText = `y: ${Utils.RoundTwo(
              event.viewportPoint.x
            )}`;
          }
        });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
