import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { ViewMode } from "src/app/models/view-mode";
import { NotificationService } from "src/app/services/notification.service";
import { PlayerService } from "src/app/services/player.service";
import { ViewService } from "src/app/services/view.service";
import { consts } from "src/environments/consts";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-footer-toolbar",
  templateUrl: "./footer-toolbar.component.html",
  styleUrls: ["./footer-toolbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterToolbarComponent extends BaseComponent implements OnInit {
  mode: ViewMode = consts.appearance.defaultMode;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ViewMode = ViewMode;
  isPlaying = true;
  message: string | null = "";
  isPan = false;
  constructor(
    private playerService: PlayerService,
    private cdRef: ChangeDetectorRef,
    private viewService: ViewService,
    private notification: NotificationService
  ) {
    super();
    this.cdRef.detach();
  }
  ngOnInit(): void {
    this.notification.footerMessageSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message) => {
        if (this.message !== message) {
          this.message = message;
          this.cdRef.detectChanges();
        }
      });
    this.playerService.playSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p) => {
        if (this.isPlaying !== p) {
          this.isPlaying = p;
          this.cdRef.detectChanges();
        }
      });
    this.viewService.viewModeSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mode) => {
        if (this.mode !== mode) {
          this.mode = mode;
          this.cdRef.detectChanges();
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
