import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

  constructor(private playerService: PlayerService) { }
  isPaused = true;
  ngOnInit() {
  }

  first() {
    this.playerService.first();
  }
  prev() {
    this.playerService.prev();
  }
  play() {
    this.playerService.play();
  }
  pause() {
    this.playerService.pause();
  }
  right() {
    this.playerService.right();
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
    this.playerService.pan();
  }
}
