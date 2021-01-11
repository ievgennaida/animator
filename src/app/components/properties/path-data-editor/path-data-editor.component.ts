import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { takeUntil, throttleTime } from "rxjs/operators";
import { PathDataHandleType } from "src/app/models/path-data-handle";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import { Property } from "src/app/models/Properties/Property";
import { BaseCommand } from "src/app/services/commands/base-command";
import { MouseOverService } from "src/app/services/mouse-over.service";
import {
  PathDataPropertyKey,
  PropertiesService,
} from "src/app/services/properties.service";
import { BaseComponent } from "../../base-component";

interface PathDataNode {
  title: string;
  hover: boolean;
  active: boolean;
  command: PathDataCommand;
  pathData: PathData;
  values: string;
  tooltip: string;
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
      .filter((p) => p.commandType === PathDataHandleType.Point);

    this.items = data.map((p, index) => {
      const mouseOver = !!mouseOverPoints.find(
        (overHandle) =>
          overHandle.commandType === PathDataHandleType.Point &&
          overHandle.commandIndex === index &&
          overHandle.node === this.property.node
      );
      return {
        title: p.saveAsRelative ? p.type.toLocaleLowerCase() : p.type,
        pathData,
        command: p,
        hover: mouseOver,
        active: false,
        selected: false,
        values: "",
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
    this.mouseOverService.pathDataSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$), throttleTime(100))
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
  onItemClick(action: PathDataNode) {}
  mouseEnter(action: PathDataNode) {}

  mouseLeave(action: PathDataNode) {}
}
