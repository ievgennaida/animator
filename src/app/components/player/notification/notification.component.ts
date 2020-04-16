import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base-component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends BaseComponent implements OnInit {

  constructor() {
    super();
   }

  ngOnInit(): void {
  }

}
