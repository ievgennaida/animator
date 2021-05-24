import { Injectable } from "@angular/core";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathDataConverter } from "src/app/models/path/path-data-converter";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { LoggerService } from "../../logger.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "../../properties.service";
import { SelectionService } from "../../selection.service";
import { ChangeStateMode } from "../../state-subject";
import { PointOnPathUtils } from "../../utils/path-utils/point-on-path";
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
    if (command.isType(PathType.moveAbs)) {
      const nextNodeClose = pathData.isSegmentEnd(command.next);
      if (!nextNodeClose && command.next) {
        if (command.next.isType(PathType.closeAbs)) {
          // Delete element
        } else {
          const newValues = [command.next.p.x, command.next.p.y];
          const newCommands = PathDataConverter.convertCommand(
            command,
            PathType.moveAbs
          );
          newCommands.forEach((p) => (p.values = newValues));
          pathData.replaceCommand(command, ...newCommands);
        }
      }
      pathData.deleteCommand(command);
      if (nextNodeClose && command.next) {
        pathData.deleteCommand(command.next);
      }
    } else if (command.isType(PathType.closeAbs)) {
      pathData.deleteCommand(command);
    } else {
      const headOfTheFigure = PointOnPathUtils.getPrevByType(
        command,
        false,
        PathType.moveAbs,
        PathType.closeAbs
      );
      if (!headOfTheFigure) {
        this.logger.warn("Path data segment head cannot be found");
        return;
      }
      const closeCommandOfFigure = PointOnPathUtils.getNextByType(
        headOfTheFigure,
        false,
        PathType.closeAbs,
        PathType.moveAbs
      );
      const isClosed =
        (headOfTheFigure &&
          closeCommandOfFigure &&
          headOfTheFigure.isType(PathType.moveAbs) &&
          closeCommandOfFigure.isType(PathType.closeAbs)) ||
        false;
      const commandIndex = command.index;
      const prevCommand = command.prev;
      const nextCommand = command.next;
      let closeCommandIndex = -1;
      if (closeCommandOfFigure) {
        closeCommandIndex = closeCommandOfFigure.index;
      }
      // We should close Z with line and make current element closing element.
      if (isClosed) {
        const headIndex = headOfTheFigure.index;
        if (closeCommandIndex !== -1) {
          // Reorder path data to keep z closed -> (z will become a line) and current element will be a closing one.
          // It means that current node will become the first node in the collection.
          pathData.moveCommands(
            headIndex,
            commandIndex,
            closeCommandIndex - commandIndex
          );
        }

        // Close current element element with the line
        pathData.convertCommand(headOfTheFigure, PathType.lineAbs);
      }
      // Current element becomes close element:
      // Remove next commands if necessary.
      if (
        //isClosed ||
        !nextCommand ||
        nextCommand.isType(PathType.moveAbs, PathType.closeAbs)
      ) {
        pathData.deleteCommand(command);
      } else {
        pathData.convertCommand(command, PathType.moveAbs);
      }

      // Remove prev commands if necessary.
      if (prevCommand) {
        pathData.removeCommandsChainByType(
          prevCommand,
          false,
          true,
          PathType.move
        );
      }
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
