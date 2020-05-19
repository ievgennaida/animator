import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";
import { PlayerService } from "src/app/services/player.service";

import { takeUntil } from "rxjs/operators";
import { ViewService } from "src/app/services/view.service";
import { ViewMode } from "src/app/models/view-mode";
import { consts } from "src/environments/consts";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-footer-toolbar",
  templateUrl: "./footer-toolbar.component.html",
  styleUrls: ["./footer-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterToolbarComponent extends BaseComponent implements OnInit {
  constructor(
    private playerService: PlayerService,
    private cdRef: ChangeDetectorRef,
    private viewService: ViewService
  ) {
    super();
  }
  mode: ViewMode = consts.appearance.defaultMode;
  ViewMode = ViewMode;
  isPlaying = true;
  isPan = false;

  ngOnInit() {
    this.playerService.playSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p) => {
        if (this.isPlaying !== p) {
          this.isPlaying = p;
          this.cdRef.markForCheck();
        }
      });
    this.viewService.viewModeSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mode) => {
        if (this.mode !== mode) {
          this.mode = mode;
          this.cdRef.markForCheck();
        }
      });
  }

  first() {
    this.playerService.first();
  }
  prev() {
    this.playerService.prev();
  }
  play() {
    this.playerService.togglePlay();
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
