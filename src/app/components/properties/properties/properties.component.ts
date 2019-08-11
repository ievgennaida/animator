import { Component, OnInit } from "@angular/core";
import { StateService } from "src/app/services/state.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Node } from "src/app/models/Node";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
  styleUrls: ["./properties.component.scss"]
})
export class PropertiesComponent implements OnInit {
  constructor(private stateService: StateService) {}

  private destroyed$ = new Subject();
  node: Node = null;
  ngOnInit() {
    this.stateService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p: Node) => {
        this.node = p;
      });
  }

  onNameFocusOut(){
    
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
