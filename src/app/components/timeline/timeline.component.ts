import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PlayerService } from "src/app/services/player.service";
import { consts } from "src/environments/consts";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { ActionService } from "src/app/services/actions/action.service";
import { Keyframe } from "src/app/models/keyframes/Keyframe";
import { ViewService } from "src/app/services/view.service";
import { OutlineService } from "src/app/services/outline.service";
import { BaseComponent } from "../base-component";
import {
  Timeline,
  TimelineOptions,
  TimelineRow,
  TimelineModel,
  TimelineRowStyle,
  TimelineElement,
  TimelineElementType,
  TimelineEventSource,
} from "animation-timeline-js";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent extends BaseComponent
  implements OnInit, OnDestroy {
  constructor(
    private propertiesService: PropertiesService,
    private outlineService: OutlineService,
    private viewService: ViewService,
    private playerService: PlayerService,
    private actionService: ActionService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    super();
    this.cdRef.detach();
  }

  options: TimelineOptions;
  model: TimelineModel = { rows: [] as Array<TimelineRow> };
  scrollTop = 0;
  timeline: Timeline;

  @Output()
  public timelineScroll: EventEmitter<any> = new EventEmitter();
  ngOnInit() {
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

  init() {
    const onDraw = () => {
      this.playerService.synchronizeTimelineWithPlayer();
      window.requestAnimationFrame(onDraw);
    };

    window.requestAnimationFrame(onDraw);

    this.options = {
      id: "timeline",
      fillColor: "#252526",
      rowsStyle: {
        color: "#333333",
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
        this.actionService.StartTransaction(keyframes);
        this.propertiesService.emitPropertyChanged(null);
      }
    });

    this.timeline.onDragFinished((args) => {
      if (args) {
        this.propertiesService.emitPropertyChanged(null);
        this.actionService.Commit();
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

  public onWheel(event: WheelEvent) {
    // Wire wheel events with other divs over the app.
    if (this.timeline) {
      this.timeline._handleWheelEvent(event);
    }
  }

  resolveRowsVisibility(tc: any, node: TreeNode, hidden: boolean) {
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

  redraw() {
    if (!this.timeline) {
      return;
    }

    this.timeline.rescale();
    this.timeline.redraw();
  }
}
