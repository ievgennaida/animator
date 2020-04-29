import { default as lottie, AnimationItem } from "node_modules/lottie-web";
import { IPlayer } from "../../models/interfaces/player";

export class LottiePlayer implements IPlayer {
  // Model has limited list of the described properties.
  private player: AnimationItem | any = null;
  constructor(player: AnimationItem) {
    this.player = player;
  }

  getElement(): AnimationItem | any{
    return this.player;
  }

  dispose() {
    if (this.player) {
      this.player.destroy();
    }
  }

  isReady(): boolean {
    return !!this.player;
  }

  isPlaying(): boolean {
    return !!this.player && !this.player.isPaused;
  }

  goTo(time: number): boolean {
    if (!this.player || !this.player.animationData) {
      return false;
    }

    const frame = this.msToFrame(time) - this.getStartPosition();
    this.player.goToAndStop(frame, true);
    return true;
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

  getStartPosition(): number {
    if (!this.player || !this.player.animationData) {
      return 0;
    }

    const initialFrame = this.player.animationData.ip;
    return isNaN(initialFrame) ? 0 : initialFrame;
  }

  getEndPosition(): number {
    if (!this.player || !this.player.animationData) {
      return 0;
    }

    const initialFrame = this.player.animationData.op;
    return isNaN(initialFrame) ? 0 : initialFrame;
  }

  first(): boolean {
    if (!this.isReady()) {
      return false;
    }

    const first = this.getStartPosition();
    this.player.goToAndStop(first, true);
    return true;
  }

  prev(): boolean {
    if (!this.isReady()) {
      return false;
    }

    this.player.goToAndStop(this.player.currentFrame - 1, true);
    return true;
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

  pause(): boolean {
    if (!this.isReady()) {
      return;
    }

    if (!this.player.isPaused) {
      this.player.pause();
    }
  }

  next(): boolean {
    if (!this.isReady()) {
      return false;
    }

    this.player.goToAndStop(this.player.currentFrame + 1, true);
    return true;
  }

  last(): boolean {
    if (!this.isReady()) {
      return false;
    }

    const pos = this.getEndPosition();

    this.player.goToAndStop(pos, true);
    return true;
  }

  loop(): boolean {
    if (!this.isReady()) {
      return false;
    }
  }

  bounce(): boolean {
    if (!this.isReady()) {
      return false;
    }
  }
}
