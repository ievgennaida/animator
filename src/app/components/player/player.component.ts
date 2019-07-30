import { Component, OnInit, Input } from '@angular/core';

import { default as lottie, AnimationItem, AnimationConfigWithData } from "node_modules/lottie-web";
import { StateService } from 'src/app/services/state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input('isPlaying')
  get isPaused() {
    return false;
    //return this.animation.isPaused;
  }

  animation: AnimationItem = null;

  private destroyed$ = new Subject();
  constructor(private stateService: StateService, private playerService: PlayerService) { }

  ngOnInit() {
    this.loadData(null);
    this.stateService.data.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      this.loadData(p);
    })
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  loadData(data) {
 
    if (this.animation) {
      this.animation.destroy();
    }

    if (!data) {
      return;
    }

    let animParams = {
      container: document.getElementById("player") as Element,
      renderer: 'svg',
      loop: true,
      prerender: true,
      autoplay: false,
      animationData: data,
    } as AnimationConfigWithData;

    this.animation = lottie.loadAnimation(animParams);

    this.stateService.onDataParsed(animParams.animationData);
  }

}
