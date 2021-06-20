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
import { Breadcrumb } from "./breadcrumb-item";

@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  empty = { title: "None" } as Breadcrumb;

  items: Breadcrumb[] = [];
  constructor(
    private selectionService: SelectionService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }
  ngOnInit(): void {
    this.selectionService.selectedSubject
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
          this.items.push(this.empty);
        }

        this.cdRef.detectChanges();
      });
  }
  convert(node: TreeNode): Breadcrumb {
    return { title: node.name, node } as Breadcrumb;
  }

  populateBreadcrumbs(
    array: Breadcrumb[],
    node: TreeNode | null
  ): Breadcrumb[] {
    if (!node) {
      return [];
    }
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
