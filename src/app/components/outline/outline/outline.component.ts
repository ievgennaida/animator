import {
  Component,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Subject } from "rxjs";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { ScrollEventArgs } from "animation-timeline-js";
import { shapeType } from "src/app/models/Lottie/shapes/shapeType";
import { SelectedData } from 'src/app/models/SelectedData';
import { OutlineService } from 'src/app/services/outline.service';

@Component({
  selector: "app-outline",
  templateUrl: "./outline.component.html",
  styleUrls: ["./outline.component.scss"]
})
export class OutlineComponent implements OnInit, OnDestroy {
  constructor(
    private outlineService: OutlineService
  ) {}

  scrollTop: any = 0;
  height: any = "";
  dataSource = this.outlineService.flatDataSource;
  treeControl = this.outlineService.treeConrol;
  private destroyed$ = new Subject();
  // Allow to use enums in the template:
  shapeType = shapeType;

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  setSelected(event, node: TreeNode) {
    this.outlineService.setSelectedNode(node, event.ctrlKey);
  }

  public setSize(args: ScrollEventArgs) {
    this.scrollTop = args.scrollTop;
    this.height = args.scrollHeight - consts.timelineHeaderHeight;
  }

  hasChild = (_: number, node: TreeNode) => node.expandable;
}
