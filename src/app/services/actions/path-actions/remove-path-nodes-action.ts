import { Injectable } from "@angular/core";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "../../logger.service";
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
  constructor(
    private selectionService: SelectionService,
    propertiesService: PropertiesService,
    private logger: LoggerService
  ) {
    super(propertiesService);
  }
  execute(): void {
    if (!this.committed) {
      // Perform initially action and store committed values.
      this.commit();
    } else {
      // Restore actions were committed, this is called from undo service.
      super.execute();
    }
  }

  removeNode(command: PathDataCommand): void {
    const pathData = command.pathData;
    if (!pathData) {
      this.logger.warn("Cannot remove node. path Data cannot be empty");
      return;
    }
    pathData.removeCommand(command);
  }

  /**
   * Remove segment connecting command and previous.
   *
   * @param command to remove.
   *
   */
  removeSegment(command: PathDataCommand) {
    const pathData = command.pathData;
    if (!pathData) {
      this.logger.warn("Cannot remove node. path Data cannot be empty");
      return;
    }
    if (command.isType(PathType.closeAbs)) {
      this.removeNode(command);
      return;
    }

    const nextCommand = command.next;
    if (!nextCommand || nextCommand.isType(PathType.moveAbs)) {
      this.removeNode(command);
      return;
    }
    if (command.isType(PathType.moveAbs) && nextCommand) {
      command = nextCommand;
    }
    if (command.isType(PathType.closeAbs)) {
      pathData.deleteCommand(command);
    } else {
      const segmentCommands = pathData.getSegment(command);
      const closeElement = segmentCommands.find((p) =>
        p.isType(PathType.closeAbs)
      );

      // We should close Z with line and make current element starting element of the path
      if (closeElement) {
        const head = segmentCommands[0];
        const headIndex = head.index;
        const closeIndex = closeElement?.index;
        if (closeIndex !== -1) {
          // Reorder path data to keep z closed -> (z will become a line) and current element will be a closing one.
          // It means that current node will become the first node in the collection.
          const commandsToTake = command.index - headIndex;
          pathData.moveCommands(headIndex, closeIndex, commandsToTake);
        }
        pathData.deleteCommand(closeElement);
        // Close current element element with the line
        pathData.convertCommand(head, PathType.lineAbs);
      } else {
        const prevCommand = command.prev;
        if (!prevCommand || prevCommand.isType(PathType.moveAbs)) {
          this.removeNode(prevCommand || command);
          return;
        }
      }
      // Current element becomes close element:
      // Remove next commands if necessary.
      pathData.convertCommand(command, PathType.moveAbs);
    }
  }

  commit() {
    if (!this.nodes || !this.items) {
      return;
    }
    // Make a snapshot of a state
    this.saveInitialValues(this.nodes, [PathDataPropertyKey]);

    const items = new Map<TreeNode, PathData>();
    this.items.forEach((p) => {
      if (p.type === PathDataHandleType.curve) {
        this.removeSegment(p.command);
      } else if (p.type === PathDataHandleType.point) {
        this.removeNode(p.command);
      }
      if (p.pathData) {
        items.set(p.node, p.pathData);
      }
    });

    this.selectionService.pathDataSubject.change(
      this.items,
      ChangeStateMode.remove
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
      .filter(
        (p) =>
          !(
            p.type === PathDataHandleType.handleA ||
            p.type === PathDataHandleType.handleB
          )
      )
      .sort((a, b) => b.commandIndex - a.commandIndex);
    this.items = [...filtered];
    this.nodes = Utils.distinctElement(items.map((p) => p.node));
    this.title = `Remove: ${Utils.getTreeNodesTitle(this.nodes)}`;
  }
}
