import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Property } from "src/app/models/Properties/Property";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";
import { DNumberProperty } from "src/app/models/Properties/DNumberProperty";
import { Subscription } from "rxjs";
import { TimeData } from 'src/app/models/timedata';

@Component({
  selector: "app-dnumeric",
  templateUrl: "./dnumeric.component.html",
  styleUrls: ["./dnumeric.component.scss"]
})
export class DnumericComponent implements OnInit, OnDestroy {
  constructor(
    private playerService: PlayerService,
    private propertiesService: PropertiesService
  ) {}

  @Input()
  property: DNumberProperty = null;
  subscription: Subscription[] = [];
  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.forEach(element => {
      element.unsubscribe();
    });
  }
}
