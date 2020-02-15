import { Injectable } from "@angular/core";
import { AnimationItem } from "lottie-web";
import { LottieModel } from "../models/Lottie/LottieModel";
import { Timeline } from "animation-timeline-js";
import { BehaviorSubject, Observable } from "rxjs";
import { EventEmitter } from "events";
import { TimeData } from "../models/timedata";
import { AppFactory } from "./app-factory";
import { StateService } from "./state.service";
import { IPlayer } from "./interfaces/player";

@Injectable({
  providedIn: "root"
})
export class PlayerService {
  // Current active animation player in the app.
  player: IPlayer = null;
  constructor() {}

  timeline: Timeline;
  playSubject = new BehaviorSubject<boolean>(false);
  // Current frame subject
  timeSubject = new BehaviorSubject<TimeData>(new TimeData());

  setTimeline(timeline: Timeline | any) {
    this.timeline = timeline;
    this.syncornizeTimelineWithPlayer(true);
  }

  dispose() {
    if (this.player) {
      this.player.dispose();
    }
  }

  setPlayer(player: IPlayer) {
    if (this.player && this.player !== player) {
      this.dispose();
    }
    this.player = player;
    this.syncornizeTimelineWithPlayer(true);
  }

  emitPlayChanged() {
    if (this.playSubject.value !== this.isPlaying()) {
      this.playSubject.next(this.isPlaying());
    }
  }

  syncornizeTimelineWithPlayer(forced = false) {
    if (!this.isReady()) {
      return;
    }

    this.emitPlayChanged();

    if (!this.isPlaying() && !forced) {
      return;
    }

    const time = this.getTime();
    const isSet = this.timeline.setTime(time);
    if (isSet) {
      this.timeline.redraw();
      this.emitTimeChanged(time);
    }
  }

  private emitTimeChanged(time: number) {
    const timeData = this.timeSubject.value;
    timeData.ms = time;
    timeData.frame = time / 1000;
    timeData.globalFrame = this.msToFrame(time);
    this.timeSubject.next(this.timeSubject.value);
  }

  isReady() {
    return this.player && this.player.isReady() && this.timeline;
  }

  isPlaying() {
    return this.player.isPlaying();
  }

  goTo(time: number) {
    if (this.isReady() && this.player.goTo(time)) {
      this.emitTimeChanged(time);
    }
  }

  getTime(): number {
    if (!this.isReady()) {
      return 0;
    }
    return this.player.getTime();
  }

  msToFrame(ms: number) {
    if (!this.isReady()) {
      return ms;
    }
    return this.player.msToFrame(ms);
  }

  frameToMs(frame: number): number {
    return this.player.frameToMs(frame);
  }

  getStartPosition() {
    if (!this.isReady()) {
      return 0;
    }
    return this.player.getStartPosition();
  }

  getEndPosition() {
    if (!this.isReady()) {
      return 0;
    }
    return this.player.getStartPosition();
  }

  first() {
    if (!this.isReady()) {
      return;
    }

    if (this.player.first()) {
      this.syncornizeTimelineWithPlayer(true);
    }
  }

  tooglePlay() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  prev() {
    if (!this.isReady()) {
      return;
    }

    if (this.player.prev()) {
      this.syncornizeTimelineWithPlayer(true);
    }
  }

  play(): boolean {
    if (!this.isReady()) {
      return false;
    }

    this.player.play();
  }

  pause() {
    if (!this.isReady()) {
      return;
    }

    this.player.pause();
  }

  next() {
    if (!this.isReady()) {
      return;
    }

    if (this.player.next()) {
      this.syncornizeTimelineWithPlayer(true);
    }
  }

  last() {
    if (!this.isReady()) {
      return;
    }

    if (this.player.last()) {
      this.syncornizeTimelineWithPlayer(true);
    }
  }

  loop() {
    if (!this.isReady()) {
      return;
    }
  }

  bounce() {
    if (!this.isReady()) {
      return;
    }
  }

  panMode() {
    if (!this.isReady()) {
      return;
    }

    this.timeline.setPanMode(true);
  }

  selectMode() {
    if (!this.isReady()) {
      return;
    }

    this.timeline.setPanMode(false);
  }
}
