import { Component, OnInit, OnDestroy } from '@angular/core';
import { default as timeline, AnimationTimelineOptions, Timeline } from 'node_modules/animation-timeline-js/index.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from 'src/app/services/state.service';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {

  private destroyed$ = new Subject();
  constructor(private stateService: StateService) { }

  ngOnInit() {
    const player:Timeline = timeline.initialize({ id: 'timeline', backgroundColor:'#252526', } as AnimationTimelineOptions);
    this.stateService.panelResize.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      player.rescale();
      player.redraw();
    })
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
