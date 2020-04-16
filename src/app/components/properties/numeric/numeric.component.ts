import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Property } from "src/app/models/Properties/Property";
import { NumberProperty } from "src/app/models/Properties/NumberProperty";
import { PropertiesService } from "src/app/services/properties.service";
import { PlayerService } from "src/app/services/player.service";
import { Subscription } from "rxjs";
import { TimeData } from "src/app/models/timedata";
import { BaseComponent } from '../../base-component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-numeric",
  templateUrl: "./numeric.component.html",
  styleUrls: ["./numeric.component.scss"],
})
export class NumericComponent extends BaseComponent implements OnInit {
  constructor(
    private playerService: PlayerService,
    private propertiesService: PropertiesService
  ) {
    super();
  }

  @Input()
  label = "";

  @Input()
  property: NumberProperty = null;
  ngOnInit() {
    this.playerService.timeSubject
    .asObservable()
    .pipe(takeUntil(this.destroyed$))
    .subscribe((value: TimeData) => {
      if (this.property) {
        this.property.setValueAtTime(value.frame);
      }
    })
  }

  onValueChanged(event) {
    if (this.property) {
      this.property.setValue(parseInt(event.target.value, 2));
      this.propertiesService.emitPropertyChanged(this.property);
    }
  }
}
