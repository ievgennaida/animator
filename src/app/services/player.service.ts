import { Injectable } from "@angular/core";
import { Timeline, TimelineInteractionMode } from "animation-timeline-js";
import { BehaviorSubject, Observable } from "rxjs";
import { TimeData } from "../models/timedata";
import { IPlayer } from "../models/interfaces/player";

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

  isReady(): boolean {
    return !!this.player && this.player.isReady() && !!this.timeline;
  }

  isPlaying(): boolean {
    if (!this.isReady()) {
      return false;
    }
    return this.player.isPlaying();
  }

  goTo(time: number): boolean {
    if (this.isReady() && this.player.goTo(time)) {
      this.emitTimeChanged(time);
      return true;
    }

    return false;
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

  getStartPosition(): number {
    if (!this.isReady()) {
      return 0;
    }
    return this.player.getStartPosition();
  }

  getEndPosition(): number {
    if (!this.isReady()) {
      return 0;
    }
    return this.player.getStartPosition();
  }

  first(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player.first()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }

    return false;
  }

  tooglePlay() {
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

    if (this.player.prev()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }

    return false;
  }

  play(): boolean {
    if (!this.isReady()) {
      return false;
    }

    return this.player.play();
  }

  pause(): boolean {
    if (!this.isReady()) {
      return;
    }

    return this.player.pause();
  }

  next(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player.next()) {
      this.synchronizeTimelineWithPlayer(true);
      return true;
    }

    return false;
  }

  last(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.player.last()) {
      this.synchronizeTimelineWithPlayer(true);
    }
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
    if (!this.isReady()) {
      return;
    }

    this.timeline.setInteractionMode(TimelineInteractionMode.Pan);
  }

  selectMode() {
    if (!this.isReady()) {
      return;
    }

    this.timeline.setInteractionMode(TimelineInteractionMode.Selection);
  }
}
