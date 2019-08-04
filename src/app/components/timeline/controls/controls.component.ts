import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, OnDestroy {

  constructor(private playerService: PlayerService) { }
  isPaused = true;
  isPan = false;
  ngOnInit() {
    this.playerService.playSubject.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      this.isPaused = !p;
    })
  }

  private destroyed$ = new Subject();
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  first() {
    this.playerService.first();
  }
  prev() {
    this.playerService.prev();
  }
  play() {
    this.isPaused = false;
    this.playerService.play();
  }
  pause() {
    this.playerService.pause();
  }
  next() {
    this.playerService.next();
  }
  last() {
    this.playerService.last();
  }
  loop() {
    this.playerService.loop();
  }
  bounce() {
    this.playerService.bounce();
  }
  pan() {
    this.isPan = true;
    this.playerService.panMode();
  }

  select() {
    this.isPan = false;
    this.playerService.selectMode();
  }

}
