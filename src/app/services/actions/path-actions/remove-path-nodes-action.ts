import { Injectable } from "@angular/core";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../../outline.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "../../properties.service";
import { SelectionService } from "../../selection.service";
import { ChangeStateMode } from "../../state-subject";
import { Utils } from "../../utils/utils";
import { BasePropertiesStorageAction } from "../base-property-action";

/**
 * Undo/redo add element action
 */
@Injectable({
  providedIn: "root",
})
export class RemovePathNodesAction extends BasePropertiesStorageAction {
  constructor(
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    propertiesService: PropertiesService
  ) {
    super(propertiesService);
  }
  icon = "clear";
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
      // Restore actions were committed, this is called from undo service.
      super.execute();
    }
  }

  isSegmentEnd(command?: PathDataCommand | null): boolean {
    return (
      !command ||
      command.isType(PathType.closeAbs) ||
      //
      command.index === command.pathData.commands.length - 1
    );
  }
  removeNode(command: PathDataCommand) {
    const pathData = command.pathData;
    if (command.isType(PathType.moveAbs)) {
      // In this case replace make no sense:
      const nextNodeClose = this.isSegmentEnd(command.next);
      if (!nextNodeClose) {
        if (command.next.isType(PathType.closeAbs)) {
          // Delete element
        } else {
          // Replace command:
          const newCommand = new PathDataCommand(PathType.moveAbs, [
            command.next.p.x,
            command.next.p.y,
          ]);
          newCommand.isRelative = command.isRelative;
          newCommand.pathData = command.pathData;
          command.pathData.commands[command.next.index] = newCommand;
        }
      }
      pathData.deleteCommand(command);
      if (nextNodeClose && command.next) {
        pathData.deleteCommand(command.next);
      }
    } else {
      pathData.deleteCommand(command);
    }

    if (command.next.isType(PathType.moveAbs)) {
      if (!command.next) {
        return false;
      } else if (
        command.next.isType(PathType.moveAbs) &&
        command.next.isType(PathType.closeAbs)
      ) {
      }
    }
  }
  commit() {
    // Make a snapshot of a state
    this.saveInitialValues(this.nodes, [PathDataPropertyKey]);

    const items = new Map<TreeNode, PathData>();
    const pointHandlers = this.items.filter(
      (p) => p.commandType === PathDataHandleType.Point
    );

    pointHandlers.forEach((p) => {
      this.removeNode(p.command);
      items.set(p.node, p.pathData);
    });

    this.selectionService.pathDataSubject.change(
      pointHandlers,
      ChangeStateMode.Remove
    );
    items.forEach((pathData, node) => {
      this.propertiesService.setPathData(node, pathData);
      node.cleanCache();
    });
    super.commit();
  }
  init(items: PathDataHandle[]) {
    // Important, clone the reference to keep it for undo service
    const filtered = items
      .filter((p) => p.commandType === PathDataHandleType.Point)
      .sort((a, b) => b.commandIndex - a.commandIndex);
    this.items = [...filtered];
    this.nodes = Utils.distinctElement(items.map((p) => p.node));
    this.title = `Remove: ${Utils.getTreeNodesTitle(this.nodes)}`;
  }
}
