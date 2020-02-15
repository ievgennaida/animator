export interface IPlayer {
  dispose();
  isReady(): boolean;
  isPlaying(): boolean;
  goTo(time: number): boolean;
  getTime(): number;
  msToFrame(ms: number): number;
  frameToMs(frame: number): number;
  getStartPosition(): number;
  getEndPosition(): number;
  first(): boolean;
  prev(): boolean;
  play(): boolean;
  pause(): boolean;
  next(): boolean;
  last(): boolean;
  loop(): boolean;
  bounce(): boolean;
}
