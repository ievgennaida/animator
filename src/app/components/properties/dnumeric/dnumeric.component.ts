import { Component, Input, OnInit } from "@angular/core";
import { DNumberProperty } from "src/app/models/properties/dnumber-property";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-dnumeric",
  templateUrl: "./dnumeric.component.html",
  styleUrls: ["./dnumeric.component.scss"],
})
export class DnumericComponent extends BaseComponent implements OnInit {
  @Input()
  property: DNumberProperty | null = null;
  constructor(
    private playerService: PlayerService,
    private propertiesService: PropertiesService
  ) {
    super();
  }
  ngOnInit(): void {}
}
