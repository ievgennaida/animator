import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { Properties } from "src/app/models/properties/properties";
import { Property } from "src/app/models/properties/property";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "src/app/services/outline.service";
import { PropertiesService } from "src/app/services/properties.service";
import { SelectionService } from "src/app/services/selection.service";
import { State } from "src/app/services/state-subject";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
  styleUrls: ["./properties.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  node: TreeNode | null = null;
  icon: string | null = null;
  properties: Properties | null = null;
  nameProperty: Property | null = null;
  name: string | null = null;
  type: string | null = null;
  namePropertiesVisible = false;
  constructor(
    private propertiesService: PropertiesService,
    private outlineService: OutlineService,
    private cdRef: ChangeDetectorRef,
    private selectionService: SelectionService
  ) {
    super();
    this.cdRef.detach();
  }

  ngOnInit(): void {
    this.selectionService.selectedSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p: State<TreeNode>) => {
        if (p.values) {
          if (p.values.length === 0) {
            this.properties = null;
            this.nameProperty = null;
            this.name = null;
            this.type = null;
            this.namePropertiesVisible = false;
          } else if (p.values.length === 1) {
            this.namePropertiesVisible = true;
            this.node = p.values[0];
            if (this.node) {
              this.properties = this.node.properties;
              this.nameProperty = this.nameProperty;
              this.name = this.node.name;
              this.icon = this.node.icon;
              this.type = this.node.typeTitle;
            }
          } else {
            this.namePropertiesVisible = true;
            // TODO: merge sibling properties, allow to edit.
            this.properties = null;
            this.nameProperty = null;
            this.name = `Selected (${p.values.length})`;
            const uniqueTypes: Array<TreeNode> = [];
            p.values.forEach((element) => {
              if (
                !uniqueTypes.find(
                  (uniqueType) => uniqueType.type === element.type
                )
              ) {
                uniqueTypes.push(element);
              }
            });
            if (uniqueTypes.length === 1) {
              this.type = uniqueTypes[0].typeTitle;
              this.icon = uniqueTypes[0].icon;
            } else {
              this.type = `(${uniqueTypes.length})`;
              this.icon = null;
            }
          }
        }
        this.cdRef.detectChanges();
      });
  }

  onNameFocusOut(e: Event): void {
    if (this.node && this.node.nameProperty) {
      const input = e.target as HTMLInputElement;
      this.node.nameProperty.setValue(input.value);
      this.propertiesService.emitPropertyChanged(this.node.nameProperty);
    }
  }
}
