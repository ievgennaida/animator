import { Injectable } from "@angular/core";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../../outline.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "../../properties.service";
import { SelectionService } from "../../selection.service";
import { Utils } from "../../utils/utils";
import { BasePropertiesStorageAction } from "../base-property-action";

/**
 * Undo/redo add path node action.
 */
@Injectable({
  providedIn: "root",
})
export class AddPathNodesAction extends BasePropertiesStorageAction {
  constructor(
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    propertiesService: PropertiesService
  ) {
    super(propertiesService);
  }
  icon = "add-black-18dp.svg";
  iconSVG = true;
  nodes: TreeNode[] | null = null;
  items: PathDataHandle[] | null = null;
  containers: TreeNode[] = [];
  committed = false;
  /**
   * Store virtual dom indexes.
   */
  treeNodeIndex: number[] = [];
  /**
   * Real elements indexes (can be different from virtual dom)
   */
  indexes: number[] = [];
  execute() {
    if (!this.committed) {
      // Perform initially action and store committed values.
      this.commit();
    } else {
      // Restore actions were committed.
      super.execute();
    }
  }

  commit() {
    this.saveInitialValues(this.nodes, [PathDataPropertyKey]);

    this.nodes.forEach((node) => {
      const pathData = node.getPathData();
      this.items.forEach((p) => {
        if (p.commandType === PathDataHandleType.Point && p.node === node) {
          // data.deleteCommand(p.command);
        }
        // p.command.smooth();
      });

      this.propertiesService.setPathData(node, pathData);
      // node.cleanCache();
    });

    super.commit();
  }
  init(items: PathDataHandle[]) {
    // Important, clone the reference to keep it for undo service
    const filtered = items.filter(
      (p) => p.commandType === PathDataHandleType.Point
    );
    this.items = [...filtered];
    this.nodes = Utils.distinctElement(items.map((p) => p.node));
    this.title = `Add: ${Utils.getTreeNodesTitle(this.nodes)}`;
  }
}
