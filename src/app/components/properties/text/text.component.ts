import { Component, OnInit, Input } from "@angular/core";
import { Property } from "src/app/models/properties/property";
import { PropertiesService } from "src/app/services/properties.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-text",
  templateUrl: "./text.component.html",
  styleUrls: ["./text.component.scss"],
})
export class TextComponent extends BaseComponent implements OnInit {
  @Input()
  property: Property | null = null;
  constructor(private propertiesService: PropertiesService) {
    super();
  }

  onValueChanged(event): void {
    if (this.property) {
      this.property.setValue(event.target.value);
      this.propertiesService.emitPropertyChanged(this.property);
    }
  }

  ngOnInit(): void {}
}
