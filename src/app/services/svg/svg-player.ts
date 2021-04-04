import { IPlayer } from "../../models/interfaces/player";

export class SvgPlayer implements IPlayer {
  // Model has limited list of the described properties.
  private player: SVGSVGElement;
  constructor(player: SVGSVGElement) {
    this.player = player;
  }

  dispose() {}

  isReady(): boolean {
    return !!this.player && !!this.player.animationsPaused;
  }

  isPlaying(): boolean {
    return !!this.player && !this.player.animationsPaused();
  }

  goTo(time: number): boolean {
    if (!this.player) {
      return false;
    }

    const frame = this.msToFrame(time) - this.getStartPosition();
    this.player.setCurrentTime(frame + time);
    return true;
  }

  getTime(): number {
    if (!this.isReady()) {
      return 0;
    }

    return (
      this.frameToMs(this.getStartPosition()) +
      this.frameToMs(this.player.getCurrentTime())
    );
  }

  msToFrame(ms: number) {
    return ms;
  }

  frameToMs(frame: number): number {
    return frame;
  }

  getStartPosition(): number {
    return 0;
  }

  getEndPosition(): number {
    if (!this.player) {
      return 0;
    }

    return 0;
  }

  first(): boolean {
    if (!this.isReady()) {
      return false;
    }

    const first = this.getStartPosition();

    this.player.setCurrentTime(first);
    return true;
  }

  prev(): boolean {
    if (!this.isReady()) {
      return false;
    }

    this.player.setCurrentTime(this.player.getCurrentTime() - 1);
    return true;
  }

  play(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (!this.isPlaying()) {
      this.player.unpauseAnimations();
    }

    return this.isPlaying();
  }

  pause(): boolean {
    if (!this.isReady()) {
      return false;
    }

    if (this.isPlaying()) {
      this.player.pauseAnimations();
    }

    return true;
  }

  next(): boolean {
    if (!this.isReady()) {
      return false;
    }

    this.player.setCurrentTime(this.player.getCurrentTime() + 1);
    return true;
  }

  last(): boolean {
    if (!this.isReady()) {
      return false;
    }

    return true;
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
}
