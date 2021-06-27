import { Injectable } from "@angular/core";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathDataConverter } from "src/app/models/path/path-data-converter";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../../outline.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "../../properties.service";
import { SelectionService } from "../../selection.service";
import { PointOnPathUtils } from "../../utils/path-utils/point-on-path";
import { Utils } from "../../utils/utils";
import { BasePropertiesStorageAction } from "../base-property-action";

/**
 * Undo/redo add path node action.
 */
@Injectable({
  providedIn: "root",
})
export class AddPathNodesAction extends BasePropertiesStorageAction {
  icon = "add-black-18dp.svg";
  title = "add node";
  tooltip = "Added path data node";
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
  constructor(
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    propertiesService: PropertiesService
  ) {
    super(propertiesService);
  }
  execute(): void {
    if (!this.committed) {
      // Perform initially action and store committed values.
      this.commit();
    } else {
      // Restore actions were committed.
      super.execute();
    }
  }

  replaceZWithLine(command: PathDataCommand): PathDataCommand[] {
    if (!command?.isClose()) {
      return [];
    }
    const convertedItems = PathDataConverter.convertCommand(
      command,
      PathType.lineAbs
    );
    const prevMove = PointOnPathUtils.getPrevByType(
      command,
      true,
      PathType.moveAbs
    );
    if (prevMove?.p) {
      convertedItems.forEach((newCommand) => {
        newCommand.p = prevMove?.p;
      });
    }
    command.pathData?.insertCommands(command.index, convertedItems);
    return convertedItems;
  }
  commit() {
    if (!this.nodes) {
      return;
    }
    this.saveInitialValues(this.nodes, [PathDataPropertyKey]);

    this.nodes.forEach((node) => {
      const pathData = node.getPathData();
      if (!pathData || !this.items) {
        return;
      }
      // Close current element element with the line
      // pathData.convertCommand(head, PathType.lineAbs);

      this.items.forEach((p) => {
        const command = p.command;
        const toCubicBezier = command.isAbsolute()
          ? PathType.cubicBezierAbs
          : PathType.cubicBezier;
        if (command.isClose()) {
          // Insert line before close and split it
          const newCommands = this.replaceZWithLine(command);
          newCommands.forEach((newCommand) => {
            pathData.convertCommand(newCommand, toCubicBezier);
          });
        } else {
          pathData.convertCommand(command, toCubicBezier);
        }
        if (p.type === PathDataHandleType.point && p.node === node) {
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
    const filtered = items.filter((p) => p.type === PathDataHandleType.curve);
    this.items = [...filtered];
    this.nodes = Utils.distinctElement(items.map((p) => p.node));
    this.title = `Add node: ${Utils.getNodesCommandsTitles(filtered)}`;
  }
}
