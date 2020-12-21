import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { TimelineScrollEvent } from "animation-timeline-js";
import { OutlineService } from "src/app/services/outline.service";
import { consts } from "src/environments/consts";
import { BaseComponent } from "../../base-component";

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
  treeControl = this.outlineService.treeControl;
  ngOnInit(): void {
    this.cdRef.detectChanges();
  }

  public setSize(args: TimelineScrollEvent) {
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
