import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { StateService } from "src/app/services/state.service";
import { Subject } from "rxjs";
import { Node } from "src/app/models/Node";
import { takeUntil } from "rxjs/operators";
import { consts } from "src/environments/consts";
import { ScrollEventArgs } from "animation-timeline-js";
import { shapeType } from "src/app/models/Lottie/shapes/shapeType";

@Component({
  selector: "app-outline",
  templateUrl: "./outline.component.html",
  styleUrls: ["./outline.component.scss"]
})
export class OutlineComponent implements OnInit, OnDestroy {
  constructor(
    private stateService: StateService
  ) {}

  scrollTop: any = 0;
  height: any = "";
  dataSource = this.stateService.flatDataSource;
  private destroyed$ = new Subject();
  // Allow to use enums in the template:
  shapeType = shapeType;

  activeNode: Node = null;

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  setSelected(node: Node) {
    this.activeNode = node;
    this.stateService.setSelected(node);
  }

  public setSize(args: ScrollEventArgs) {
    this.scrollTop = args.scrollTop;
    this.height = args.scrollHeight - consts.timelineHeaderHeight;
  }

  hasChild = (_: number, node: Node) => node.expandable;
}
