import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  Timeline,
  TimelineElement,
  TimelineElementType,
  TimelineEventSource,
  TimelineModel,
  TimelineOptions,
  TimelineRow,
  TimelineRowStyle,
} from "animation-timeline-js";
import { takeUntil } from "rxjs/operators";
import { Keyframe } from "src/app/models/keyframes/keyframe";
import { TreeNode } from "src/app/models/tree-node";

import { OutlineService } from "src/app/services/outline.service";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";
import { ViewService } from "src/app/services/view.service";
import { consts } from "src/environments/consts";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  @Output()
  public timelineScroll: EventEmitter<any> = new EventEmitter();

  options: TimelineOptions | null = null;
  model: TimelineModel = { rows: [] as Array<TimelineRow> };
  scrollTop = 0;
  timeline: Timeline | null = null;

  constructor(
    private propertiesService: PropertiesService,
    private outlineService: OutlineService,
    private viewService: ViewService,
    private playerService: PlayerService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    super();
    this.cdRef.detach();
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.init();
    });

    if (this.timeline) {
      // Sync scroll between outline and tree view.
      this.timeline.onScroll((args) => {
        this.timelineScroll.emit(args);
      });
    }
  }

  init(): void {
    const onDraw = () => {
      this.playerService.synchronizeTimelineWithPlayer();
      window.requestAnimationFrame(onDraw);
    };

    window.requestAnimationFrame(onDraw);

    this.options = {
      id: "timeline",
      rowsStyle: {
        height: consts.timelineHeaderHeight,
      } as TimelineRowStyle,
    } as TimelineOptions;

    this.timeline = new Timeline(this.options, this.model);
    this.playerService.setTimeline(this.timeline);

    this.timeline.onTimeChanged((args) => {
      if (args.source === TimelineEventSource.User) {
        this.playerService.goTo(args.val);
      }
    });

    this.timeline.onDragStarted((args) => {
      if (args) {
        const keyframes = (args.elements as Array<TimelineElement>)
          .filter((p) => p.type === TimelineElementType.Keyframe && p.keyframe)
          .map((p) => p.keyframe as Keyframe);
        this.propertiesService.emitPropertyChanged(null);
      }
    });

    this.timeline.onDragFinished((args) => {
      if (args) {
        this.propertiesService.emitPropertyChanged(null);
      }
    });

    const ds = this.outlineService.flatDataSource;
    const tc = this.outlineService.treeControl;

    ds._flattenedData
      .pipe(takeUntil(this.destroyed$))
      .subscribe((flatItems) => {
        this.model.rows.length = 0;

        flatItems.forEach((element) => {
          this.model.rows.push(element.lane);
        });

        ds.data.forEach((p) => this.resolveRowsVisibility(tc, p, false));

        this.timeline.setModel(this.model);
        this.redraw();

        this.timeline.setScrollTop(0);
      });

    tc.expansionModel.changed.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      ds.data.forEach((p) => this.resolveRowsVisibility(tc, p, false));
      this.redraw();
    });

    this.propertiesService.changed
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.redraw();
      });

    this.viewService.resized.pipe(takeUntil(this.destroyed$)).subscribe((p) => {
      this.redraw();
    });
  }

  public onWheel(event: WheelEvent): void {
    // Wire wheel events with other divs over the app.
    if (this.timeline) {
      this.timeline._handleWheelEvent(event);
    }
  }

  resolveRowsVisibility(tc: any, node: TreeNode, hidden: boolean): void {
    node.lane.hidden = hidden;
    if (!hidden) {
      if (tc.isExpandable(node)) {
        hidden = !tc.isExpanded(node);
      }
    }

    // node.lane.name = node.name + " " + node.lane.hidden;
    if (node.children) {
      node.children.forEach((p) => this.resolveRowsVisibility(tc, p, hidden));
    }
  }

  redraw(): void {
    if (!this.timeline) {
      return;
    }

    this.timeline.rescale();
    this.timeline.redraw();
  }
}
