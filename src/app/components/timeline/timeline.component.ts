import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { default as timeline, AnimationTimelineOptions, Timeline, AnimationTimelineLane } from 'animation-timeline-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from 'src/app/services/state.service';
import { PlayerService } from 'src/app/services/player.service';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {

  private destroyed$ = new Subject();
  constructor(private stateService: StateService, private playerService: PlayerService) { }
  @Output()
  public timelineScroll: EventEmitter<any> = new EventEmitter();
  lanes: AnimationTimelineLane[] = [];
  ngOnInit() {
    let options = { id: 'timeline', laneColor: '#333333', laneHeightPx: 30, backgroundColor: '#252526', } as AnimationTimelineOptions;

    const player: Timeline = timeline.initialize(options, this.lanes);
    player.on("timeChanged", (args) => {
      if (args.source == "user") {
        this.playerService.goTo(args.ms);
        this.playerService.pause();
      }
    });
    
    player.on("scroll", (args) => {
      this.timelineScroll.emit(args);
    });

    player.on("keyframeChanged", (args) => {
      if (args) {
        args.forEach((p) => {
          if (p.prop && p.data) {
            this.playerService.changeKeyframeValue(p, p.ms);
          }
        });
      }
    });

    this.stateService.nodes
      .pipe(takeUntil(this.destroyed$)).subscribe(p => {
        //this.lanes.length = 0;
        p.forEach(element => {
          this.lanes.push({} as AnimationTimelineLane);
        });
       

        //alert(this.lanes.length);
        player.setLanes(this.lanes);
        player.rescale();
        player.redraw();
      })

    this.stateService.onResize.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      player.rescale();
      player.redraw();
    });

    this.stateService.data.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      player.setLanes(this.lanes);
      player.rescale();
      player.redraw();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
