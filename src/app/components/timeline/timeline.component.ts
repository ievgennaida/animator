import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from "@angular/core";
import {
  default as timeline,
  AnimationTimelineOptions,
  Timeline,
  AnimationTimelineLane,
  ScrollEventArgs
} from "animation-timeline-js";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { StateService } from "src/app/services/state.service";
import { PlayerService } from "src/app/services/player.service";
import { consts } from "src/environments/consts";
import { Node } from "src/app/models/Node";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.scss"]
})
export class TimelineComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  constructor(
    private stateService: StateService,
    private playerService: PlayerService
  ) {}

  lanes: AnimationTimelineLane[] = [];
  options: AnimationTimelineOptions;
  scrollTop: number = 0;
  timeline: Timeline;

  @ViewChild("timeline", { static: false, read: ElementRef })
  timelineElement: ElementRef;

  @Output()
  public timelineScroll: EventEmitter<any> = new EventEmitter();



  ngOnInit() {
    let onDraw = timestamp => {
      this.playerService.syncornizeTimelineWithPlayer();
      window.requestAnimationFrame(onDraw);
    };

    window.requestAnimationFrame(onDraw);

    this.options = {
      id: "timeline",
      laneColor: "#333333",
      laneHeightPx: consts.timelineHeaderHeight,
      backgroundColor: "#252526"
    } as AnimationTimelineOptions;

    this.timeline = timeline.initialize(this.options, this.lanes);
    this.playerService.setTimeline(this.timeline);
    this.timeline.on("timeChanged", args => {
      if (args.source == "user") {
        this.playerService.goTo(args.ms);
      }
    });

    this.timeline.on("scroll", (args: ScrollEventArgs) => {
      this.timelineScroll.emit(args);
    });

    this.timeline.on("keyframeChanged", args => {
      if (args) {
        args.forEach(p => {
          if (p.prop && p.data) {
            this.playerService.changeKeyframeValue(p, p.ms);
          }
        });
      }
    });

    const ds = this.stateService.flatDataSource;
    const tc = this.stateService.treeConrol;

    ds._flattenedData.pipe(takeUntil(this.destroyed$)).subscribe(flatItems => {
      this.lanes.length = 0;

      flatItems.forEach(element => {
        this.lanes.push(element.lane);
      });

      ds.data.forEach(p => this.resolveLanesVisibilty(tc, p, false));
      this.timeline.setLanes(this.lanes);
      this.redraw();
    });

    tc.expansionModel.onChange
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        ds.data.forEach(p => this.resolveLanesVisibilty(tc, p, false));
        this.redraw();
      });

    this.stateService.onResize.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      this.redraw();
    });
  }

  public onWheel(event: WheelEvent) {
    // Wire wheel events with other divs over the app.
    if (this.timelineElement.nativeElement) {
      let scroll =
        Math.sign(event.deltaY) *
        this.timelineElement.nativeElement.scrollHeight *
        0.125;
      this.timelineElement.nativeElement.scrollTop += scroll;
    }
  }

  resolveLanesVisibilty(tc: any, node: Node, hidden: boolean) {
    node.lane.hidden = hidden;
    if (!hidden) {
      if (tc.isExpandable(node)) {
        hidden = !tc.isExpanded(node);
      }
    }

    // node.lane.name = node.name + " " + node.lane.hidden;
    if (node.children) {
      node.children.forEach(p => this.resolveLanesVisibilty(tc, p, hidden));
    }
  }

  redraw() {
    if (!this.timeline) {
      return;
    }
    
    this.timeline.rescale();
    this.timeline.redraw();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
