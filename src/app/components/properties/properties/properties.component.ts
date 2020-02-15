import { Component, OnInit } from "@angular/core";
import { StateService } from "src/app/services/state.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TreeNode } from "src/app/models/tree-node";
import { PropertiesService } from "src/app/services/properties.service";
import { Keyframe } from "src/app/models/keyframes/Keyframe";
import { SelectedData } from "src/app/models/SelectedData";
import { Properties } from "src/app/models/Properties/Properties";
import { Property } from "src/app/models/Properties/Property";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
  styleUrls: ["./properties.component.scss"]
})
export class PropertiesComponent implements OnInit {
  constructor(
    private propertiesService: PropertiesService,
    private stateService: StateService
  ) {}

  private destroyed$ = new Subject();
  node: TreeNode = null;
  icon: string = null;
  properties: Properties = null;
  nameProperty: Property = null;
  name: string = null;
  type: string = null;
  namePropertiesVisible = false;
  ngOnInit() {
    this.stateService.selected
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p: SelectedData) => {
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
            p.nodes.forEach(element => {
              if (!uniqueTypes.find(p => p.type == element.type)) {
                uniqueTypes.push(element);
              }
            });
            if (uniqueTypes.length == 1) {
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
