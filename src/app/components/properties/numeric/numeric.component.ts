import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Property } from "src/app/models/Properties/Property";
import { NumberProperty } from "src/app/models/Properties/NumberProperty";
import { PropertiesService } from "src/app/services/properties.service";
import { PlayerService } from "src/app/services/player.service";
import { Subscription } from "rxjs";
import { TimeData } from 'src/app/services/models/timedata';

@Component({
  selector: "app-numeric",
  templateUrl: "./numeric.component.html",
  styleUrls: ["./numeric.component.scss"]
})
export class NumericComponent implements OnInit, OnDestroy {
  constructor(
    private playerService: PlayerService,
    private propertiesService: PropertiesService
  ) {}

  @Input()
  label = "";

  @Input()
  property: NumberProperty = null;
  subscription: Subscription[] = [];
  ngOnInit() {
    this.subscription.push(
      this.playerService.timeSubject
        .asObservable()
        .subscribe((value: TimeData) => {
          if (this.property) {
            this.property.setValueAtTime(value.frame);
          }
        })
    );
  }

  onValueChanged(event) {
    if (this.property) {
      this.property.setValue(parseInt(event.target.value));
      this.propertiesService.emitPropertyChanged(this.property);
    }
  }

  ngOnDestroy() {
    this.subscription.forEach(element => {
      element.unsubscribe();
    });
  }
}
