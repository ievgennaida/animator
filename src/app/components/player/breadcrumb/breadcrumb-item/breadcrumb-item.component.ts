import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core";
import { TreeNode } from "src/app/models/tree-node";
import {
  SelectionService
} from "src/app/services/selection.service";
import { BaseComponent } from 'src/app/components/base-component';
import { MouseOverService } from 'src/app/services/mouse-over.service';
import { ChangeStateMode } from 'src/app/services/state-subject';
export class Breadcrumb {
  node: TreeNode;
  title: string;
}
@Component({
  selector: "app-breadcrumb-item",
  templateUrl: "./breadcrumb-item.component.html",
  styleUrls: ["./breadcrumb-item.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbItemComponent extends BaseComponent implements OnInit {
  showNext = true;
  @Input("showNext")
  set setShowNext(value: boolean) {
    if (this.showNext !== value) {
      this.showNext = value;
      this.cdRef.detectChanges();
    }
  }
  item: Breadcrumb;

  @Input("item") set setNode(value: Breadcrumb) {
    if (this.item !== value) {
      this.item = value;
      this.cdRef.detectChanges();
    }
  }
  constructor(
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private selectionService: SelectionService,
    private mouseOverService: MouseOverService
  ) {
    super();
    this.cdRef.detach();
  }

  ngOnInit(): void {}
  setSelected(event: MouseEvent) {
    if (!this.item || !this.item.node) {
      return;
    }
    const mode = ChangeStateMode.Normal;
    this.ngZone.runOutsideAngular(() => {
      this.selectionService.setSelected(this.item.node, mode);
    });
  }

  mouseEnter(event: MouseEvent) {
    if (!this.item || !this.item.node) {
      return;
    }
    this.ngZone.runOutsideAngular(() =>
      this.mouseOverService.setMouseOver(this.item.node)
    );
  }

  mouseLeave(event: MouseEvent) {
    if (!this.item || !this.item.node) {
      return;
    }
    this.ngZone.runOutsideAngular(() =>
      this.mouseOverService.setMouseLeave(this.item.node)
    );
  }
}
