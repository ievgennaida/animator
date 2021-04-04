import { Injectable } from "@angular/core";
import { Timeline, TimelineInteractionMode } from "animation-timeline-js";
import { BehaviorSubject } from "rxjs";
import { IPlayer } from "../models/interfaces/player";
import { TimeData } from "../models/timedata";

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  // Current active animation player in the app.
  player: IPlayer | null = null;

  timeline: Timeline | null = null;
  playSubject = new BehaviorSubject<boolean>(false);
  // Current frame subject
  timeSubject = new BehaviorSubject<TimeData>(new TimeData());
  constructor() {}

  setTimeline(timeline: Timeline | any) {
    this.timeline = timeline;
    this.synchronizeTimelineWithPlayer(true);
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
    this.synchronizeTimelineWithPlayer(true);
  }

  emitPlayChanged() {
    if (this.playSubject.value !== this.isPlaying()) {
      this.playSubject.next(this.isPlaying());
    }
  }

  synchronizeTimelineWithPlayer(forced = false) {
    if (!this.isReady() || !this.timeline) {
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

  isReady(): boolean {
    return !!this.player && this.player.isReady() && !!this.timeline;
  }

  isPlaying(): boolean {
    if (!this.isReady()) {
      return false;
    }
    return this.player?.isPlaying() || false;
  }

  goTo(time: number): boolean {
    if (this.isReady() && this.player?.goTo(time)) {
      this.emitTimeChanged(time);
      return true;
    }

    return false;
  }

  getTime(): number {
    if (!this.isReady()) {
      return 0;
    }
    return this.player?.getTime() || 0;
  }

  msToFrame(ms: number): number {
    if (!this.isReady()) {
      return ms;
    }
    return this.player?.msToFrame(ms) || 0;
  }

  frameToMs(frame: number): number {
    return this.player?.frameToMs(frame) || 0;
  }

  getStartPosition(): number {
    if (!this.isReady()) {
      return 0;
    }
    return this.player?.getStartPosition() || 0;
  }

  getEndPosition(): number {
    if (!this.isReady()) {
      return 0;
    }
    return this.player?.getStartPosition() || 0;
  }

  first(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player?.first()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }

    return false;
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  prev(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player?.prev()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }

    return false;
  }

  play(): boolean {
    if (!this.isReady()) {
      return false;
    }

    return this.player?.play() || false;
  }

  pause(): boolean {
    if (!this.isReady()) {
      return false;
    }

    return this.player?.pause() || false;
  }

  next(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player?.next()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }

    return false;
  }

  last(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player?.last()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }
    return false;
  }

  loop(): boolean {
    if (!this.isReady()) {
      return false;
    }

    return true;
  }

  bounce(): boolean {
    if (!this.isReady()) {
      return false;
    }

    return true;
  }

  panMode() {
    if (!this.isReady() || !this.timeline) {
      return;
    }

    this.timeline.setInteractionMode(TimelineInteractionMode.Pan);
  }

  selectMode() {
    if (!this.isReady() || !this.timeline) {
      return;
    }

    this.timeline.setInteractionMode(TimelineInteractionMode.Selection);
  }
  private emitTimeChanged(time: number) {
    const timeData = this.timeSubject.value;
    timeData.ms = time;
    timeData.frame = time / 1000;
    timeData.globalFrame = this.msToFrame(time);
    this.timeSubject.next(this.timeSubject.value);
  }
}
