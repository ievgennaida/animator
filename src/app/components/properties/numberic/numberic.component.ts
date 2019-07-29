import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-numberic',
  templateUrl: './numberic.component.html',
  styleUrls: ['./numberic.component.scss']
})
export class NumbericComponent implements OnInit {

  constructor() { }
  @Input()
  label = '';
  
  ngOnInit() {
  }

}
