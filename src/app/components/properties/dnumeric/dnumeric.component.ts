import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Property } from "src/app/models/Properties/Property";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";
import { DNumberProperty } from "src/app/models/Properties/DNumberProperty";
import { Subscription } from "rxjs";
import { TimeData } from 'src/app/models/timedata';
import { BaseComponent } from '../../base-component';

@Component({
  selector: "app-dnumeric",
  templateUrl: "./dnumeric.component.html",
  styleUrls: ["./dnumeric.component.scss"]
})
export class DnumericComponent extends BaseComponent implements OnInit {
  constructor(
    private playerService: PlayerService,
    private propertiesService: PropertiesService
  ) {
    super();
  }

  @Input()
  property: DNumberProperty = null;
  ngOnInit() {
  }

}
