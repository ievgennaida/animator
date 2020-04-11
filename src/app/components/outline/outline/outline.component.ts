import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Subject } from "rxjs";
import { consts } from "src/environments/consts";
import { ScrollEventArgs } from "animation-timeline-js";
import { shapeType } from "src/app/models/Lottie/shapes/shapeType";
import { OutlineService } from "src/app/services/outline.service";
import { MatMenu } from "@angular/material/menu";

@Component({
  selector: "app-outline",
  templateUrl: "./outline.component.html",
  styleUrls: ["./outline.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineComponent implements OnInit, OnDestroy {
  constructor(
    private outlineService: OutlineService,
    private cdRef: ChangeDetectorRef
  ) {}
  @Input() allowScroll = false;
  scrollTop: any = 0;
  height: any = "";
  dataSource = this.outlineService.flatDataSource;
  treeControl = this.outlineService.treeConrol;
  private destroyed$ = new Subject();
  // Allow to use enums in the template:
  shapeType = shapeType;
  @ViewChild("edit")
  menu: MatMenu;

  @ViewChild("edit", { read: ElementRef })
  menuEl: ElementRef<HTMLElement>;
  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public setSize(args: ScrollEventArgs) {
    let changed = false;
    if (this.scrollTop !== args.scrollTop) {
      this.scrollTop = args.scrollTop;
      changed = true;
    }
    const headerHeight = args.scrollHeight - consts.timelineHeaderHeight;
    if (this.height !== headerHeight) {
      this.height = headerHeight;
      changed = true;
    }
    if (changed) {
      this.cdRef.detectChanges();
    }
  }
}
