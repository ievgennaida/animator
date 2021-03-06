import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AdornerPointType } from "src/app/models/adorner-point-type";
import { CursorType } from "src/app/models/cursor-type";
import { HandleData } from "src/app/models/handle-data";
import { TreeNode } from "src/app/models/tree-node";
import { consts } from "src/environments/consts";
import { MouseEventArgs } from "../../models/mouse-event-args";
import { TransformationMode } from "../../models/transformation-mode";
import { AddElementAction } from "../actions/add-element-action";
import { AdornersService } from "../adorners-service";
import { CursorService } from "../cursor.service";
import { DocumentService } from "../document.service";
import { MouseOverMode, MouseOverService } from "../mouse-over.service";
import { NotificationService } from "../notification.service";
import { OutlineService } from "../outline.service";
import { MouseOverRenderer } from "../renderers/mouse-over.renderer";
import { SelectionService } from "../selection.service";
import { ShapesRepositoryService } from "../shapes-repository-service";
import { UndoService } from "../undo.service";
import { Utils } from "../utils/utils";
import { ViewService } from "../view.service";
import { AutoPanService } from "./auto-pan-service";
import { BaseTool } from "./base.tool";
import { SelectionTool } from "./selection.tool";
import { TransformsService } from "./transforms.service";

@Injectable({
  providedIn: "root",
})
export class ShapeTool extends BaseTool {
  icon = "crop_square";
  container: TreeNode | null = null;
  protected destroyed$ = new Subject<void>();

  constructor(
    private viewService: ViewService,
    private documentService: DocumentService,
    private selectionService: SelectionService,
    private outlineService: OutlineService,
    private mouseOverService: MouseOverService,
    private adornerService: AdornersService,
    private autoPanService: AutoPanService,
    private transformsService: TransformsService,
    private selectionTool: SelectionTool,
    private notificationMessage: NotificationService,
    private cursor: CursorService,
    private mouseOverRenderer: MouseOverRenderer,
    private shapesRepositoryService: ShapesRepositoryService,
    private undoService: UndoService
  ) {
    super();
  }
  onActivate() {
    this.mouseOverService.setMode(MouseOverMode.containers);
    this.mouseOverRenderer.clear();
    this.cursor.setDefaultCursor(CursorType.default);
    super.onActivate();

    // Update current when nodes are changed and container is not there anymore.
    this.outlineService.nodesSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((nodes) => {
        if (!this.container || nodes.indexOf(this.container) < 0) {
          this.updateCurrentContainer();
        }
      });

    // Update current container when new container is selected:
    this.selectionService.selectedSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.updateCurrentContainer();
      });

    // Update message on mouse over
    this.mouseOverService.mouseOverSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.updateCurrentContainer();
      });

    // Update current container when new document is created
    this.documentService.documentSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.updateCurrentContainer();
      });

    this.updateCurrentContainer();
  }
  onDeactivate() {
    this.mouseOverService.setMode(MouseOverMode.elements);
    this.destroyed$.next();
    super.onDeactivate();
    this.cleanUp();
    this.notificationMessage.hideMessage();
  }

  onWindowKeyUp(event: KeyboardEvent) {
    if (event.key === consts.changeContainerKey) {
      const mouseOver = this.getMouseOverContainerOrRoot();
      if (mouseOver && this.container !== mouseOver) {
        this.selectionService.setSelected(mouseOver);
      }
    }
  }
  updateCurrentContainer() {
    this.container = this.getCurrentContainer();
    this.updateContainerName();
  }
  updateContainerName() {
    // Show container name that will be used:
    if (this.container && this.outlineService.rootNode !== this.container) {
      this.notificationMessage.showMessage(`Container: ${this.container.name}`);
    } else {
      this.notificationMessage.hideMessage();
    }
  }
  getCurrentContainer(): TreeNode | null {
    const document = this.documentService.getDocument();
    if (!document || !document.rootElement) {
      return null;
    }

    let containerTreeNode = document.rootNode;
    const nodes = this.selectionService.getSelected();
    if (nodes.length > 0) {
      containerTreeNode =
        nodes.find((node) => document?.parser?.isContainer(node)) ||
        document.rootNode;
    }

    if (
      containerTreeNode &&
      !document?.parser?.isContainer(containerTreeNode)
    ) {
      return null;
    }
    return containerTreeNode;
  }

  onViewportMouseDown(event: MouseEventArgs) {
    if (!this.viewService.isInit()) {
      return;
    }

    event.preventDefault();
    event.handled = true;
    this.mouseOverRenderer.suspend(true);
    const document = this.documentService.getDocument();
    if (!document || !document.rootElement || !this.container) {
      return;
    }

    const screenPoint = event.screenPoint;
    const pos = Utils.toElementPoint(this.container, screenPoint);
    if (!pos || !screenPoint) {
      return;
    }
    const element = this.shapesRepositoryService.createRect();
    element.setAttribute("width", "1px");
    element.setAttribute("height", "1px");
    element.setAttribute("x", Utils.round(pos.x).toString());
    element.setAttribute("y", Utils.round(pos.y).toString());
    const newTreeNode = document?.parser?.convertTreeNode(element, true);
    if (!newTreeNode) {
      return;
    }
    this.outlineService.expandToTop(this.container);

    const action = this.undoService.getAction(AddElementAction);
    action.init(this.container, newTreeNode);
    this.undoService.startAction(action);

    const adorner = this.adornerService.getAdorner(newTreeNode);
    const handle = new HandleData();
    handle.adorner = adorner;
    handle.handle = AdornerPointType.bottomRight;
    this.transformsService.start(
      TransformationMode.scale,
      [newTreeNode],
      screenPoint,
      handle
    );
    this.selectionService.setSelected(newTreeNode);
  }
  /**
   * Override.
   */
  onWindowMouseMove(event: MouseEventArgs) {
    if (this.transformsService.isActive()) {
      const screenPos = event.getDOMPoint();
      this.transformsService.transformByMouse(screenPos);
      this.autoPanService.update(event.clientX, event.clientY);
    } else {
      const mouseOver = this.getMouseOverContainerOrRoot();
      if (mouseOver && this.container !== mouseOver) {
        let message = `Press '${
          consts.changeContainerKey
        }' to switch parent container to '${this.limit(mouseOver.name)}'`;
        if (this.container) {
          message = `Container: ${this.limit(this.container.name)}. ` + message;
        }
        this.notificationMessage.showMessage(message);
      }
    }
  }
  limit(text: string, limit = 25): string {
    if (!text) {
      return text;
    }

    return text.substring(0, limit);
  }
  getMouseOverContainerOrRoot(): TreeNode | null {
    const document = this.documentService.getDocument();
    if (!document) {
      return null;
    }
    const mouseOver = this.mouseOverService.getValue() || document.rootNode;
    if (document?.parser?.isContainer(mouseOver)) {
      return mouseOver;
    }
    return null;
  }
  cleanUp() {
    this.mouseOverRenderer.resume();
    this.transformsService.cancel();
    this.selectionService.deselectAdorner();
  }

  onWindowMouseUp(event: MouseEventArgs) {
    // No action if transform transaction was running.
    // Transformation was applied, no need to do selection
    this.autoPanService.stop();
    this.mouseOverRenderer.resume();
    if (
      this.transformsService.isActive() &&
      this.transformsService.isChanged()
    ) {
      this.transformsService.commit();
      return;
    } else {
      this.transformsService.cancel();
    }
  }
  onWindowBlur(event: Event) {
    this.autoPanService.stop();
    this.transformsService.cancel();
    this.cleanUp();
  }
}
