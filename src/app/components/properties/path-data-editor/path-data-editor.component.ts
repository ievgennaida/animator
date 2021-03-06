import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { merge } from "rxjs";
import { takeUntil, throttleTime } from "rxjs/operators";
import { PathDataHandle } from "src/app/models/path-data-handle";
import { PathDataHandleType } from "src/app/models/path-data-handle-type";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { Property } from "src/app/models/properties/property";
import { BaseCommand } from "src/app/services/commands/base-command";
import { MouseOverService } from "src/app/services/mouse-over.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "src/app/services/properties.service";
import { SelectionService } from "src/app/services/selection.service";
import { ChangeStateMode } from "src/app/services/state-subject";
import { BaseComponent } from "../../base-component";

interface PathDataNode {
  title: string;
  hover: boolean;
  active: boolean;
  command: PathDataCommand;
  pathData: PathData;
  values: string;
  tooltip: string;
  selected: boolean;
}

@Component({
  selector: "app-path-data-editor",
  templateUrl: "./path-data-editor.component.html",
  styleUrls: ["./path-data-editor.component.scss"],
})
export class PathDataEditorComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  private static prevSelected: PathDataNode | null = null;
  @ViewChild("virtual", { static: true, read: ElementRef })
  virtualElementRef: ElementRef<HTMLElement> | null = null;
  @ViewChild("virtual", { static: true })
  virtual: CdkVirtualScrollViewport | null = null;
  @Input()
  property: Property | null = null;
  nextTickTimeout = 10;

  items: PathDataNode[] = [];
  commands: BaseCommand[] = [];

  constructor(
    private propertiesService: PropertiesService,
    private mouseOverService: MouseOverService,
    private selectionService: SelectionService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    cdRef.detach();
  }

  updateView(): void {
    if (!this.property) {
      return;
    }
    const node = this.property.node;
    if (!node) {
      this.items = [];
      this.cdRef.detectChanges();
      return;
    }
    const pathData = this.property?.node?.getPathData();
    const data = pathData?.commands || [];
    const mouseOverPoints = this.mouseOverService.pathDataSubject
      .getValues()
      .filter((p) => p.type === PathDataHandleType.point);
    const selectedPathData = this.selectionService.pathDataSubject
      .getValues()
      .filter((p) => p.type === PathDataHandleType.point);
    if (this.items?.length !== data?.length) {
      PathDataEditorComponent.prevSelected = null;
    }
    this.items = data.map((p) => {
      const mouseOver = !!mouseOverPoints.find((overHandle) =>
        overHandle.isHandle(
          this.property?.node || null,
          p,
          PathDataHandleType.point
        )
      );
      const isSelected = !!selectedPathData.find((overHandle) =>
        overHandle.isHandle(
          this.property?.node || null,
          p,
          PathDataHandleType.point
        )
      );
      return {
        title: p.saveAsRelative ? p.type.toLocaleLowerCase() : p.type,
        pathData,
        command: p,
        hover: mouseOver,
        active: false,
        selected: isSelected,
        values: p.values.join(" "),
        tooltip: "",
      } as PathDataNode;
    });

    this.cdRef.detectChanges();
  }
  ngOnInit(): void {
    this.virtual?.renderedRangeStream
      ?.pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.cdRef.detectChanges();
        },
      });

    merge(
      this.selectionService.pathDataSubject,
      this.mouseOverService.pathDataSubject
    )
      .pipe(takeUntil(this.destroyed$), throttleTime(0))
      .subscribe({
        next: (state) => {
          const changed =
            state &&
            state.changed.find(
              (changedNode) => changedNode.node === this.property?.node
            );
          if (changed) {
            this.updateView();
          }
        },
      });

    this.propertiesService.changedSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((p) => {
        if (p.key === PathDataPropertyKey && p.node === this.property?.node) {
          this.updateView();
        }
      });
    // Bug with virtual scroll viewport, should be updated on next tick.
    setTimeout(() => {
      this.updateView();
    }, this.nextTickTimeout);
  }

  onScrolled(): void {
    this.cdRef.detectChanges();
  }
  onRightClick(event: MouseEvent, node: PathDataNode): void {
    // Select one if not selected
    if (node && !node.selected) {
      this.setSelected(node, event.ctrlKey, event.shiftKey);
    }

    event.preventDefault();
    event.stopPropagation();
  }
  getHandle(action: PathDataNode): PathDataHandle | null {
    if (!this.property?.node) {
      return null;
    }
    const pathDataHandle = new PathDataHandle(
      this.property.node,
      action.command
    );
    return pathDataHandle;
  }
  setSelected(node: PathDataNode, ctrlKey = false, shiftKey = false): void {
    let mode = ChangeStateMode.normal;
    const nodes: PathDataNode[] = [];
    if (ctrlKey) {
      nodes.push(node);
      mode = ChangeStateMode.revert;
      PathDataEditorComponent.prevSelected = node;
    } else if (shiftKey) {
      const selected = PathDataEditorComponent.prevSelected;
      let item = this.items.find(
        (p) => selected && p?.command?.index === selected?.command?.index
      );
      const a = item ? this.items.indexOf(item) : -1;
      item = this.items.find((p) => p?.command?.index === node?.command?.index);
      const b = item ? this.items.indexOf(item) : -1;
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      if (from !== -1 && to !== -1) {
        for (let i = from; i <= to; i++) {
          nodes.push(this.items[i]);
        }
      }
      if (!nodes.length) {
        PathDataEditorComponent.prevSelected = node;
        nodes.push(node);
      }
    } else {
      nodes.push(node);
      PathDataEditorComponent.prevSelected = node;
    }
    const toSelect = nodes
      .map((p) => this.getHandle(p))
      .filter((p) => !!p) as PathDataHandle[];
    this.selectionService.pathDataSubject.change(toSelect, mode);
  }
  onCommandTypeClick(event: MouseEvent, node: PathDataNode): void {
    event.preventDefault();
    event.stopPropagation();
  }
  mouseEnter(action: PathDataNode): void {
    this.mouseOverService.pathDataSubject.change(this.getHandle(action));
  }

  mouseLeave(): void {
    this.mouseOverService.pathDataSubject.setNone();
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    PathDataEditorComponent.prevSelected = null;
  }
}
