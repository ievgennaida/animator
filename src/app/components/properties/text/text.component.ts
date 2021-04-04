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

  onValueChanged(e: Event): void {
    if (this.property) {
      const input = e.target as HTMLInputElement;
      this.property.setValue(input.value);
      this.propertiesService.emitPropertyChanged(this.property);
    }
  }

  ngOnInit(): void {}
}
