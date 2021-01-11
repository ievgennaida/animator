import { Component, OnInit, Input } from "@angular/core";
import { PropertiesService } from "src/app/services/properties.service";
import { ColorProperty } from "src/app/models/properties/color-property";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-color",
  templateUrl: "./color.component.html",
  styleUrls: ["./color.component.scss"],
})
export class ColorComponent extends BaseComponent implements OnInit {
  @Input()
  property: ColorProperty = null;
  constructor(private propertiesService: PropertiesService) {
    super();
  }

  ngOnInit() {}

  onValueChanged(event) {
    if (this.property) {
      // this.property.setValue(parseInt(event.target.value));
      // this.propertiesService.emitPropertyChanged(this.property);
    }
  }
}
