import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";

import { OutlineService } from "src/app/services/outline.service";
import { takeUntil } from "rxjs/operators";
import {
  SelectionService,
  SelectionMode,
} from "src/app/services/selection.service";
import { ContextMenuService } from "src/app/services/context-menu.service";
import { BaseComponent } from '../../base-component';

@Component({
  selector: "app-outline-node",
  templateUrl: "./outline-node.component.html",
  styleUrls: ["./outline-node.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineNodeComponent extends BaseComponent implements OnInit, OnDestroy {
  private static lastSelected: TreeNode = null;
  node: TreeNode;
  @Input("node") set setNode(node: TreeNode) {
    if (this.node !== node) {
      this.node = node;
      this.cdRef.detectChanges();
    }
  }

  treeControl = this.outlineService.treeConrol;
  constructor(
    private outlineService: OutlineService,
    private cdRef: ChangeDetectorRef,
    private selectionService: SelectionService,
    private ngZone: NgZone,
    private contextMenu: ContextMenuService
  ) {
    super();
    this.cdRef.detach();
    selectionService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        // Track only changed items:
        if (data && data.changed && data.changed.includes(this.node)) {
          this.cdRef.detectChanges();
        }
      });

    this.outlineService.mouseOver.subscribe((node) => {
      if (node === this.node) {
        // TODO: performance: if source != outline node.
        this.cdRef.detectChanges();
      }
    });
  }

  setSelected(event: MouseEvent, node: TreeNode) {
    let mode = SelectionMode.Normal;
    const nodes = [];
    if (event && event.ctrlKey) {
      nodes.push(node);
      mode = SelectionMode.Revert;
      OutlineNodeComponent.lastSelected = node;
    } else if (event && event.shiftKey) {
      const selected = OutlineNodeComponent.lastSelected;
      if (
        selected &&
        selected.parent &&
        node.parent &&
        selected.parent === node.parent &&
        selected.parent.children
      ) {
        const currentCollection = selected.parent.children;
        const a = currentCollection.indexOf(selected);
        const b = currentCollection.indexOf(node);
        const from = Math.min(a, b);
        const to = Math.max(a, b);
        if (from !== -1 && to !== -1) {
          for (let i = from; i <= to; i++) {
            nodes.push(currentCollection[i]);
          }
        }
      }

      if (!nodes.length) {
        OutlineNodeComponent.lastSelected = node;
        nodes.push(node);
      }
    } else {
      nodes.push(node);
      OutlineNodeComponent.lastSelected = node;
    }

    this.ngZone.runOutsideAngular(() => {
      this.selectionService.setSelected(nodes, mode);
    });
  }

  mouseEnter(node: TreeNode) {
    this.ngZone.runOutsideAngular(() => this.outlineService.setMouseOver(node));
  }

  mouseLeave(node: TreeNode) {
    this.ngZone.runOutsideAngular(() =>
      this.outlineService.setMouseLeave(node)
    );
  }

  ngOnInit(): void {}
  onRightClick(event: MouseEvent) {
    this.setSelected(event, this.node);
    this.contextMenu.open(event, this.node);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    OutlineNodeComponent.lastSelected = null;
  }
}
