import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { NumberProperty } from "src/app/models/properties/number-property";
import { PropertiesService } from "src/app/services/properties.service";
import { PlayerService } from "src/app/services/player.service";
import { TimeData } from "src/app/models/timedata";
import { BaseComponent } from "../../base-component";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-numeric",
  templateUrl: "./numeric.component.html",
  styleUrls: ["./numeric.component.scss"],
})
export class NumericComponent extends BaseComponent implements OnInit {
  @Input()
  label = "";

  @Input()
  property: NumberProperty | null = null;
  constructor(
    private playerService: PlayerService,
    private propertiesService: PropertiesService
  ) {
    super();
  }
  ngOnInit(): void {
    this.playerService.timeSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value: TimeData) => {
        if (this.property) {
          this.property.setValueAtTime(value.frame);
        }
      });
  }

  onValueChanged(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (this.property) {
      this.property.setValue(parseInt(input.value, 10));
      this.propertiesService.emitPropertyChanged(this.property);
    }
  }
}
