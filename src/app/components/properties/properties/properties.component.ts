import { Component, OnInit } from "@angular/core";
import { StateService } from "src/app/services/state.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Node } from "src/app/models/Node";
import { PropertiesService } from "src/app/services/properties.service";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
  styleUrls: ["./properties.component.scss"]
})
export class PropertiesComponent implements OnInit {
  constructor(
    private propertiesService: PropertiesService,
    private stateService: StateService
  ) {}

  private destroyed$ = new Subject();
  node: Node = null;
  ngOnInit() {
    this.stateService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p: Node) => {
        this.node = p;
      });
  }

  onNameFocusOut(event) {
    if (this.node && this.node.nameProperty) {
      this.node.nameProperty.setValue(event.target.value);
      this.propertiesService.emitPropertyChanged(this.node.nameProperty);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
