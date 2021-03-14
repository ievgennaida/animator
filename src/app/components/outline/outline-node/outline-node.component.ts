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
import { MouseOverRenderer } from "src/app/services/renderers/mouse-over.renderer";
import { SelectionService } from "src/app/services/selection.service";
import {
  ChangeStateMode,
  StateChangedSource,
} from "src/app/services/state-subject";
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
  private static prevSelected: TreeNode = null;
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
    this.treeControl.expansionModel.changed
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value) => {
        if (
          value.added.indexOf(this.node) >= 0 ||
          value.removed.indexOf(this.node) >= 0
        ) {
          // When nodes list changed.
          this.cdRef.detectChanges();
        }
      });
    this.outlineService.nodesSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        // When nodes list changed.
        OutlineNodeComponent.prevSelected = null;
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
  toggle(event: MouseEvent, node: TreeNode) {
    if (this.treeControl.isExpandable(node)) {
      this.treeControl.toggle(node);
      node.expanded = this.treeControl.isExpanded(node);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  setSelected(node: TreeNode, ctrlKey = false, shiftKey = false): void {
    let mode = ChangeStateMode.Normal;
    const nodes = [];
    if (ctrlKey) {
      nodes.push(node);
      mode = ChangeStateMode.Revert;
      OutlineNodeComponent.prevSelected = node;
    } else if (shiftKey) {
      const selected = OutlineNodeComponent.prevSelected;
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
        OutlineNodeComponent.prevSelected = node;
        nodes.push(node);
      }
    } else {
      nodes.push(node);
      OutlineNodeComponent.prevSelected = node;
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
    // Select one if not selected
    if (this.node && !this.node.selected) {
      this.setSelected(this.node, event.ctrlKey, event.shiftKey);
    }

    this.contextMenu.open(event, this.node);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    OutlineNodeComponent.prevSelected = null;
  }
}
