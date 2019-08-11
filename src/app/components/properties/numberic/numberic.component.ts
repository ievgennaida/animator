import { Component, OnInit, Input } from "@angular/core";
import { Property } from "src/app/models/Properties/Property";
import { NumberProperty } from "src/app/models/Properties/NumberProperty";
import { PropertiesService } from "src/app/services/properties.service";

@Component({
  selector: "app-numberic",
  templateUrl: "./numberic.component.html",
  styleUrls: ["./numberic.component.scss"]
})
export class NumbericComponent implements OnInit {
  constructor(private propertiesService: PropertiesService) {}
  @Input()
  label = "";

  @Input()
  property: NumberProperty = null;

  onValueChanged(event) {
    if (this.property) {
      this.property.setValue(parseInt(event.target.value));
      this.propertiesService.emitPropertyChanged(this.property);
    }
  }

  ngOnInit() {}
}
