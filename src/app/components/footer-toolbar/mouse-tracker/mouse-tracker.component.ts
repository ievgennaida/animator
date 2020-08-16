import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  OnDestroy,
  NgZone,
} from "@angular/core";

import { ToolsService } from "src/app/services/viewport/tools.service";
import { takeUntil } from "rxjs/operators";
import { Utils } from "src/app/services/utils/utils";
import { BaseComponent } from '../../base-component';
import { MouseEventArgs } from 'src/app/models/mouse-event-args';

@Component({
  selector: "app-mouse-tracker",
  templateUrl: "./mouse-tracker.component.html",
  styleUrls: ["./mouse-tracker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MouseTrackerComponent extends BaseComponent implements OnInit, OnDestroy {

  @ViewChild("outputX", { read: ElementRef })
  outputX: ElementRef<HTMLElement>;
  @ViewChild("outputY", { read: ElementRef })
  outputY: ElementRef<HTMLElement>;
  constructor(private ngZone: NgZone, private toolsService: ToolsService) {
    super();
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
            this.outputX.nativeElement.innerText = `x: ${Utils.round(
              event.viewportPoint.x
            )}`;
            this.outputY.nativeElement.innerText = `y: ${Utils.round(
              event.viewportPoint.x
            )}`;
          }
        });
    });
  }
}
