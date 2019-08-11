import { Component, OnInit, Input } from '@angular/core';
import { Property } from 'src/app/models/Properties/Property';
import { PropertiesService } from 'src/app/services/properties.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  constructor(private propertiesService: PropertiesService) {}
  
  @Input()
  property: Property = null;

  onValueChanged(event) {
    if (this.property) {
      this.property.setValue(event.target.value);
      this.propertiesService.emitPropertyChanged();
    }
  }

  ngOnInit() {
  }

}
