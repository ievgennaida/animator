import { Injectable } from "@angular/core";
import { AnimationItem } from "lottie-web";
import { LottieModel } from "../models/Lottie/LottieModel";
import { Timeline } from "animation-timeline-js";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PlayerService {
  constructor() {}

  // Model has limited list of the described properties.
  private player: AnimationItem | any = null;
  timeline: Timeline;
  playSubject = new BehaviorSubject<boolean>(false);

  setTimeline(timeline: Timeline | any) {
    this.timeline = timeline;
    this.syncornizeTimelineWithPlayer(true);
  }

  setPlayer(player: AnimationItem | any) {
    this.player = player;
    this.syncornizeTimelineWithPlayer(true);
  }

  syncornizeTimelineWithPlayer(forced = false) {
    if (!this.isReady()) {
      return;
    }

    if (this.playSubject.value !== !this.player.isPaused) {
      this.playSubject.next(!this.player.isPaused);
    }

    if (!this.isPlaying() && !forced) {
      return;
    }

    let isSet = this.timeline.setTime(this.getTime());
    if (isSet) {
      this.timeline.redraw();
    }
  }

  isReady() {
    return !!this.player && !!this.timeline;
  }

  isPlaying() {
    return !!this.player && !this.player.isPaused;
  }

  goTo(value: number) {
    if (!this.player || !this.player.animationData) {
      return 0;
    }

    this.player.goToAndStop(
      this.msToFrame(value) - this.getStartPosition(),
      true
    );
  }

  getTime(): number {
    if (!this.isReady()) {
      return 0;
    }

    return (
      this.frameToMs(this.getStartPosition()) +
      this.frameToMs(this.player.currentFrame)
    );
  }

  msToFrame(ms: number) {
    return Math.round((ms / 1000) * this.player.frameRate);
  }

  frameToMs(frame: number): number {
    return Math.round((frame * 1000) / this.player.frameRate);
  }

  getStartPosition() {
    if (!this.player || !this.player.animationData) {
      return 0;
    }

    const initialFrame = this.player.animationData.ip;
    return isNaN(initialFrame) ? 0 : initialFrame;
  }

  getEndPosition() {
    if (!this.player || !this.player.animationData) {
      return 0;
    }

    const initialFrame = this.player.animationData.op;
    return isNaN(initialFrame) ? 0 : initialFrame;
  }

  first() {
    if (!this.isReady()) {
      return;
    }

    let first = this.getStartPosition();

    this.player.goToAndStop(first, true);
    this.syncornizeTimelineWithPlayer(true);
  }

  prev() {
    if (!this.isReady()) {
      return;
    }

    this.player.goToAndStop(this.player.currentFrame - 1, true);
    this.syncornizeTimelineWithPlayer(true);
  }

  play(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player.isPaused) {
      this.player.play();
    }

    return !this.player.isPaused;
  }

  pause() {
    if (!this.isReady()) {
      return;
    }

    if (!this.player.isPaused) {
      this.player.pause();
    }
  }

  next() {
    if (!this.isReady()) {
      return;
    }

    this.player.goToAndStop(this.player.currentFrame + 1, true);
    this.syncornizeTimelineWithPlayer(true);
  }

  last() {
    if (!this.isReady()) {
      return;
    }

    let pos = this.getEndPosition();

    this.player.goToAndStop(pos, true);
    this.syncornizeTimelineWithPlayer(true);
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
