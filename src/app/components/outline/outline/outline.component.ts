import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
} from "@angular/core";

import { consts } from "src/environments/consts";
import { ScrollEventArgs } from "animation-timeline-js";
import { shapeType } from "src/app/models/Lottie/shapes/shapeType";
import { OutlineService } from "src/app/services/outline.service";
import { BaseComponent } from '../../base-component';

@Component({
  selector: "app-outline",
  templateUrl: "./outline.component.html",
  styleUrls: ["./outline.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineComponent extends BaseComponent implements OnInit {
  constructor(
    private outlineService: OutlineService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }
  @Input() allowScroll = false;
  scrollTop: any = 0;
  height: any = "";
  dataSource = this.outlineService.flatDataSource;
  treeControl = this.outlineService.treeConrol;
  // Allow to use enums in the template:
  shapeType = shapeType;
  ngOnInit(): void {
    this.cdRef.detectChanges();
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
