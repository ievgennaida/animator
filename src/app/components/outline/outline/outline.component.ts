import { FlatTreeControl } from "@angular/cdk/tree";
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
import { TreeNode } from "src/app/models/TreeNode";
import { takeUntil } from "rxjs/operators";
import { consts } from "src/environments/consts";
import { ScrollEventArgs } from "animation-timeline-js";

@Component({
  selector: "app-outline",
  templateUrl: "./outline.component.html",
  styleUrls: ["./outline.component.scss"]
})
export class OutlineComponent implements OnInit, OnDestroy {
  constructor(
    private stateService: StateService,
    private selfElement: ElementRef
  ) {
  }

  scrollTop: any = 0;
  height: any = "";
  dataSource = this.stateService.flatDataSource;
  private destroyed$ = new Subject();
  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public setSize(args: ScrollEventArgs) {
    this.scrollTop = args.scrollTop;
    this.height = args.scrollHeight - consts.timelineHeaderHeight;
  }

  hasChild = (_: number, node: TreeNode) => node.expandable;
}
