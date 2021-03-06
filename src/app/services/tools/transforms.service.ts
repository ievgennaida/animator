import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { TransformationMode } from "../../models/transformation-mode";
import { TransformAction } from "../actions/transformations/transform-action";
import { LoggerService } from "../logger.service";
import { UndoService } from "../undo.service";

/**
 * Start and handle transformation action.
 */
@Injectable({
  providedIn: "root",
})
export class TransformsService {
  transformedSubject = new Subject<SVGElement | null>();
  activeAction: TransformAction | null = null;
  constructor(
    private undoService: UndoService,
    private logger: LoggerService
  ) {}
  /*
   * Transformed observable.
   */
  public get transformed() {
    return this.transformedSubject.asObservable();
  }

  emitTransformed(element: SVGElement | null) {
    this.transformedSubject.next(element);
  }

  /**
   * Get current active transform mode.
   */
  get activeMode(): TransformationMode {
    return this.activeAction?.mode || TransformationMode.none;
  }
  /**
   * Is transformation transaction running
   */
  isActive() {
    return this.activeAction != null;
  }
  /**
   * Check whether something was changed.
   */
  isChanged() {
    return this.activeAction != null && this.activeAction.changed;
  }
  /**
   * Commit current changes.
   */
  commit(): boolean {
    let committed = false;
    if (this.activeAction) {
      committed = this.activeAction.commit();
    }
    this.activeAction = null;
    return committed;
  }

  /**
   * Cancel running action and remove it from the history.
   */
  cancel() {
    if (this.activeAction) {
      this.activeAction.undo();
      // Remove unfinished action
      this.undoService.remove(this.activeAction);
    }
    this.activeAction = null;
  }

  transformByMouse(screenPos: DOMPoint): boolean {
    if (!this.activeAction) {
      return false;
    }
    let changed = false;
    changed = this.activeAction.transformByMouse(screenPos);

    if (changed) {
      this.emitTransformed(null);
    }
    return changed;
  }

  start(
    mode: TransformationMode,
    nodes: TreeNode[],
    screenPos: DOMPoint | null,
    handle: HandleData | null
  ) {
    if (!screenPos) {
      return;
    }
    if (!nodes || nodes.length === 0) {
      this.logger.debug(
        `Cannot start transform transaction. At least one node should be set.`
      );
      return;
    }
    this.activeAction = this.undoService.getAction(TransformAction);
    if (this.logger.isDebug()) {
      this.logger.debug(`Transform transaction is started: ${nodes.length}`);
    }
    this.activeAction.init(mode, nodes, screenPos, handle);
    this.undoService.startAction(this.activeAction, false);
  }
}
