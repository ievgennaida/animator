import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";

import { SelectionService } from "src/app/services/selection.service";
import { takeUntil } from "rxjs/operators";
import { ChangedArgs } from "src/app/models/changed-args";
import { Breadcrumb } from "./breadcrumb-item/breadcrumb-item.component";
import { TreeNode } from "src/app/models/tree-node";
import { BaseComponent } from '../../base-component';

@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    private selectionService: SelectionService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }
  empty = new Breadcrumb();

  items: Breadcrumb[] = [];
  ngOnInit(): void {
    this.empty.title = "None";
    this.selectionService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((event: ChangedArgs) => {
        if (event.nodes && event.nodes.length > 0) {
          if (event.nodes.length === 1) {
            this.items.length = 0;
            const selected = event.nodes[0];
            this.populateBreadcrumbs(this.items, selected);
          } else {
            this.items.length = 0;
            this.empty.title = `Selected (${event.nodes.length})`;
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
