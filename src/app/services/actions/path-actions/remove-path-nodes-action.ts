import { Injectable } from "@angular/core";
import {
  PathDataHandle
} from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { PathType } from "src/app/models/path/path-type";
import { TreeNode } from "src/app/models/tree-node";
import { OutlineService } from "../../outline.service";
import {
  PathDataPropertyKey,
  PropertiesService
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
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    propertiesService: PropertiesService
  ) {
    super(propertiesService);
  }
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
          PathData.convertCommand(command.next, PathType.moveAbs, [
            command.next.p.x,
            command.next.p.y,
          ]);
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
  removeSegment(command: PathDataCommand) {
    const pathData = command.pathData;

    if (command.isType(PathType.moveAbs)) {
      const nextNodeClose = this.isSegmentEnd(command.next);
      if (!nextNodeClose) {
        if (command.next.isType(PathType.closeAbs)) {
          // Delete element
        } else {
          PathData.convertCommand(command, PathType.moveAbs, [
            command.next.p.x,
            command.next.p.y,
          ]);
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
      const closeCommandOfFigure = PointOnPathUtils.getNextByType(
        headOfTheFigure,
        false,
        PathType.closeAbs,
        PathType.moveAbs
      );
      const isClosed =
        headOfTheFigure &&
        closeCommandOfFigure &&
        headOfTheFigure.isType(PathType.moveAbs) &&
        closeCommandOfFigure.isType(PathType.closeAbs);
      // Current element becomes close element:
      PathData.convertCommand(command, PathType.moveAbs);
      // We should close Z with line and make current element closing element.
      if (isClosed) {
        const allCommands = command.pathData.commands;

        // Close current element element with the line
        PathData.convertCommand(headOfTheFigure, PathType.lineAbs);

        // Reorder path data to keep z closed -> (z will become a line) and current element will be a closing one.
        // It means that current node will become the first node in the collection.
        for (let i = command.index; i <= closeCommandOfFigure.index; i++) {
          const isClose = closeCommandOfFigure.index === i;
          const toMove = allCommands[i];
          pathData.deleteCommand(toMove);
          if (!isClose) {
            const headIndex = allCommands.indexOf(headOfTheFigure);
            Utils.insertElement(allCommands, toMove, headIndex);
          }
        }
      }

      let toAnalyze = command.prev;
      // Remove prev commands if necessary.
      while (toAnalyze && toAnalyze.isType(PathType.moveAbs)) {
        pathData.deleteCommand(toAnalyze);
        toAnalyze = command.prev;
      }

      toAnalyze = command.next;
      if (
        !command.next ||
        command.next.isType(PathType.moveAbs, PathType.closeAbs)
      ) {
        pathData.deleteCommand(command);
      }
      /*
      // Remove next commands if necessary.
      while (toAnalyze && toAnalyze.isType(PathType.moveAbs)) {
        pathData.deleteCommand(toAnalyze);
        toAnalyze = command.next;
      }*/
    }
  }

  commit() {
    // Make a snapshot of a state
    this.saveInitialValues(this.nodes, [PathDataPropertyKey]);

    const items = new Map<TreeNode, PathData>();
    this.items.forEach((p) => {
      if (p.type === PathDataHandleType.curve) {
        this.removeSegment(p.command);
      } else if (p.type === PathDataHandleType.point) {
        this.removeNode(p.command);
      }

      items.set(p.node, p.pathData);
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
