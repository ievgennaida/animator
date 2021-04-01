import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { TreeNode } from "src/app/models/tree-node";
import { SelectionService } from "src/app/services/selection.service";
import { State } from "src/app/services/state-subject";
import { BaseComponent } from "../../base-component";
import { Breadcrumb } from "./breadcrumb-item/breadcrumb-item.component";

@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  empty = new Breadcrumb();

  items: Breadcrumb[] = [];
  constructor(
    private selectionService: SelectionService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }
  ngOnInit(): void {
    this.empty.title = "None";
    this.selectionService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((event: State<TreeNode>) => {
        if (event.hasAny()) {
          if (event.values.length === 1) {
            this.items.length = 0;
            const selected = event.values[0];
            this.populateBreadcrumbs(this.items, selected);
          } else {
            this.items.length = 0;
            this.empty.title = `Selected (${event.values.length})`;
            this.items.push(this.empty);
          }
        } else {
          this.items.length = 0;
          this.empty.title = "None";
          this.items.push(this.empty);
        }

        this.cdRef.detectChanges();
      });
  }
  convert(node: TreeNode): Breadcrumb {
    const b = new Breadcrumb();
    b.title = node.name;
    b.node = node;
    return b;
  }

  populateBreadcrumbs(array: Breadcrumb[], node: TreeNode): Breadcrumb[] {
    array.push(this.convert(node));
    while (node != null) {
      node = node.parent;
      if (node) {
        array.push(this.convert(node));
      }
    }
    array.reverse();
    return array;
  }
}
