import { Component, OnInit, OnDestroy } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { ChangedArgs } from "src/app/models/changed-args";
import { Properties } from "src/app/models/Properties/Properties";
import { Property } from "src/app/models/Properties/Property";
import { OutlineService } from "src/app/services/outline.service";
import { SelectionService } from "src/app/services/selection.service";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
  styleUrls: ["./properties.component.scss"],
})
export class PropertiesComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    private propertiesService: PropertiesService,
    private outlineService: OutlineService,
    private selectionService: SelectionService
  ) {
    super();
  }

  node: TreeNode = null;
  icon: string = null;
  properties: Properties = null;
  nameProperty: Property = null;
  name: string = null;
  type: string = null;
  namePropertiesVisible = false;
  ngOnInit() {
    this.selectionService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p: ChangedArgs) => {
        if (p.nodes) {
          if (p.nodes.length === 0) {
            this.properties = null;
            this.nameProperty = null;
            this.name = null;
            this.type = null;
            this.namePropertiesVisible = false;
          } else if (p.nodes.length === 1) {
            this.namePropertiesVisible = true;
            this.node = p.nodes[0];
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
            this.name = `Selected (${p.nodes.length})`;
            const uniqueTypes: Array<TreeNode> = [];
            p.nodes.forEach((element) => {
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
      });
  }

  onNameFocusOut(event) {
    if (this.node && this.node.nameProperty) {
      this.node.nameProperty.setValue(event.target.value);
      this.propertiesService.emitPropertyChanged(this.node.nameProperty);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
