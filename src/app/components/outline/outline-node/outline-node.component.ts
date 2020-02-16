import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef
} from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import { Subject } from "rxjs";
import { OutlineService } from "src/app/services/outline.service";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-outline-node",
  templateUrl: "./outline-node.component.html",
  styleUrls: ["./outline-node.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutlineNodeComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();

  @Input()
  node: TreeNode = null;
  treeControl = this.outlineService.treeConrol;
  constructor(
    private outlineService: OutlineService,
    private cdRef: ChangeDetectorRef
  ) {
    outlineService.selected.pipe(takeUntil(this.destroyed$)).subscribe(data => {
      // Track only changed items:
      if (data && data.changed && data.changed.includes(this.node)) {
        this.cdRef.markForCheck();
      }
    });

    this.outlineService.mouseOver.subscribe(node => {
      if (node === this.node) {
        // TODO: performance: if source != outline node.
        this.cdRef.markForCheck();
      }
    });
  }

  setSelected(event, node: TreeNode) {
    this.outlineService.setSelectedNode(node, event.ctrlKey);
  }

  mouseEnter(node: TreeNode) {
    this.outlineService.setMouseOver(node);
  }

  mouseLeave(node: TreeNode) {
    this.outlineService.setMouseLeave(node);
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.destroyed$ = null;
  }
}
