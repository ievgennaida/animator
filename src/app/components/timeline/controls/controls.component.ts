import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { PlayerService } from "src/app/services/player.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-controls",
  templateUrl: "./controls.component.html",
  styleUrls: ["./controls.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent implements OnInit, OnDestroy {
  constructor(
    private playerService: PlayerService,
    private cdRef: ChangeDetectorRef
  ) {}
  isPlaying = true;
  isPan = false;
  private destroyed$ = new Subject();

  ngOnInit() {
    this.playerService.playSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(p => {
        if (this.isPlaying !== p) {
          this.isPlaying = p;
          this.cdRef.markForCheck();
        }
      });
  }

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
    this.playerService.tooglePlay();
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
