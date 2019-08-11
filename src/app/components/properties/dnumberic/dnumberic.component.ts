import { Component, OnInit, Input } from '@angular/core';
import { Property } from 'src/app/models/Properties/Property';

@Component({
  selector: 'app-dnumberic',
  templateUrl: './dnumberic.component.html',
  styleUrls: ['./dnumberic.component.scss']
})
export class DnumbericComponent implements OnInit {

  constructor() { }
  @Input()
  property: Property = null;

  ngOnInit() {
  }

}
