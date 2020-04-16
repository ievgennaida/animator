import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base-component';

@Component({
  selector: 'app-bool',
  templateUrl: './bool.component.html',
  styleUrls: ['./bool.component.scss']
})
export class BoolComponent extends BaseComponent implements OnInit {

  constructor() {
    super();
   }

  ngOnInit() {
  }

}
