import { Component, Input, OnInit } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { NumberProperty } from "src/app/models/properties/number-property";
import { TimeData } from "src/app/models/timedata";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";
import { BaseComponent } from "../../base-component";

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
