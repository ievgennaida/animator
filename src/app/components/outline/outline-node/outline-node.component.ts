import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { TreeNode } from "src/app/models/tree-node";
import { ContextMenuService } from "src/app/services/context-menu.service";
import { MouseOverService } from "src/app/services/mouse-over.service";
import { OutlineService } from "src/app/services/outline.service";
import { SelectionService } from "src/app/services/selection.service";
import {
  ChangeStateMode,
  StateChangedSource,
} from "src/app/services/state-subject";
import { MouseOverRenderer } from "src/app/services/viewport/renderers/mouse-over.renderer";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-outline-node",
  templateUrl: "./outline-node.component.html",
  styleUrls: ["./outline-node.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineNodeComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  private static lastSelected: TreeNode = null;
  node: TreeNode;
  @Input("node") set setNode(node: TreeNode) {
    if (this.node !== node) {
      this.node = node;
      this.cdRef.detectChanges();
    }
  }

  treeControl = this.outlineService.treeControl;
  constructor(
    private outlineService: OutlineService,
    private mouseOverService: MouseOverService,
    private mouseOverRenderer: MouseOverRenderer,
    private cdRef: ChangeDetectorRef,
    private selectionService: SelectionService,
    private ngZone: NgZone,
    private contextMenu: ContextMenuService
  ) {
    super();
    this.cdRef.detach();
  }
  ngOnInit(): void {
    this.outlineService.nodesSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        // When nodes list changed.
        this.cdRef.detectChanges();
      });
    this.selectionService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        // Track only changed items:
        if (data && data.changed && data.changed.includes(this.node)) {
          this.cdRef.detectChanges();
        }
      });

    this.mouseOverService.mouseOver
      .pipe(takeUntil(this.destroyed$))
      .subscribe((node) => {
        if (node === this.node) {
          // TODO: performance: if source != outline node.
          this.cdRef.detectChanges();
        }
      });
  }
  toggle(node: TreeNode) {
    if (this.treeControl.isExpandable(node)) {
      this.treeControl.toggle(node);
      node.expanded = this.treeControl.isExpanded(node);
    }
  }

  setSelected(event: MouseEvent, node: TreeNode) {
    let mode = ChangeStateMode.Normal;
    const nodes = [];
    if (event && event.ctrlKey) {
      nodes.push(node);
      mode = ChangeStateMode.Revert;
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
      this.selectionService.setSelected(
        nodes,
        mode,
        StateChangedSource.Outline
      );
    });
  }

  mouseEnter(node: TreeNode) {
    this.ngZone.runOutsideAngular(() =>
      this.mouseOverService.setMouseOver(node)
    );
  }

  mouseLeave(node: TreeNode) {
    this.ngZone.runOutsideAngular(() =>
      this.mouseOverService.setMouseLeave(node)
    );
  }

  onRightClick(event: MouseEvent) {
    this.setSelected(event, this.node);
    this.contextMenu.open(event, this.node);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    OutlineNodeComponent.lastSelected = null;
  }
}
