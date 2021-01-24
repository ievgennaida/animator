import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { merge } from "rxjs";
import { takeUntil, throttleTime } from "rxjs/operators";
import {
  PathDataHandle,
  PathDataHandleType,
} from "src/app/models/path-data-handle";
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
export class PathDataEditorComponent extends BaseComponent implements OnInit {
  constructor(
    private propertiesService: PropertiesService,
    private mouseOverService: MouseOverService,
    private selectionService: SelectionService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    cdRef.detach();
  }
  @ViewChild("virtual", { static: true, read: ElementRef })
  virtualElementRef: ElementRef<HTMLElement>;
  nextTickTimeout = 10;
  @ViewChild("virtual", { static: true }) virtual: CdkVirtualScrollViewport;
  items: PathDataNode[] = [];
  commands: BaseCommand[] = [];
  @Input()
  property: Property = null;
  updateView() {
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
      .filter((p) => p.type === PathDataHandleType.Point);
    const selectedPathData = this.selectionService.pathDataSubject
      .getValues()
      .filter((p) => p.type === PathDataHandleType.Point);
    this.items = data.map((p, index) => {
      const mouseOver = !!mouseOverPoints.find((overHandle) =>
        overHandle.isHandle(this.property.node, p, PathDataHandleType.Point)
      );
      const isSelected = !!selectedPathData.find((overHandle) =>
        overHandle.isHandle(this.property.node, p, PathDataHandleType.Point)
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
      .subscribe(() => {
        this.cdRef.detectChanges();
      });

    merge(
      this.selectionService.pathDataSubject,
      this.mouseOverService.pathDataSubject
    )
      .pipe(takeUntil(this.destroyed$), throttleTime(0))
      .subscribe((state) => {
        const changed =
          state &&
          state.changed.find(
            (changedNode) => changedNode.node === this.property?.node
          );
        if (changed) {
          this.updateView();
        }
      });

    this.propertiesService.changedSubject
      .asObservable()
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

  onScrolled() {
    this.cdRef.detectChanges();
  }
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  getHandle(action: PathDataNode): PathDataHandle {
    const pathDataHandle = new PathDataHandle(
      this.property.node,
      action.command
    );
    return pathDataHandle;
  }
  onItemClick(action: PathDataNode) {
    const handle = this.getHandle(action);
    let mode = ChangeStateMode.Normal;
    if (action.selected) {
      mode = ChangeStateMode.Remove;
    }

    this.selectionService.pathDataSubject.change(handle, mode);
  }
  mouseEnter(action: PathDataNode) {
    this.mouseOverService.pathDataSubject.change(this.getHandle(action));
  }

  mouseLeave(action: PathDataNode) {
    this.mouseOverService.pathDataSubject.setNone();
  }
}
