import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { TimelineScrollEvent } from "animation-timeline-js";
import { debounceTime, takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { OutlineCommandsService } from "src/app/services/commands/outline-commands-service";
import { OutlineService } from "src/app/services/outline.service";
import { SelectionService } from "src/app/services/selection.service";
import { StateChangedSource } from "src/app/services/state-subject";
import { Utils } from "src/app/services/utils/utils";
import { consts } from "src/environments/consts";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-outline",
  templateUrl: "./outline.component.html",
  styleUrls: ["./outline.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineComponent extends BaseComponent implements OnInit {
  constructor(
    private outlineService: OutlineService,
    private selectionService: SelectionService,
    private cdRef: ChangeDetectorRef,
    private outlineCommandsService: OutlineCommandsService,
    private element: ElementRef<HTMLElement>
  ) {
    super();
    this.cdRef.detach();
  }

  @ViewChild("treeScroll", { static: true, read: ElementRef })
  treeScroll: ElementRef<HTMLElement>;
  @Input() allowScroll = false;
  scrollTop: any = 0;
  smallDebounce = 10;
  height: any = "";
  dataSource = this.outlineService.flatDataSource;
  treeControl = this.outlineService.treeControl;
  commands: BaseCommand[] = [];
  ngOnInit(): void {
    this.commands = this.outlineCommandsService.getCommands();
    this.outlineCommandsService.scrollToSelectedCommand.executed
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.expandSelected();
        this.scrollToSelected();
      });
    this.outlineService.nodesSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        // When nodes list changed.
        this.cdRef.detectChanges();
      });

    this.selectionService.selected
      .pipe(
        takeUntil(this.destroyed$),
        // Debounce a bit to avoid stuck on click
        debounceTime(this.smallDebounce)
      )
      .subscribe((data) => {
        if (data && data.values) {
          this.expandSelected();
        }
        this.cdRef.detectChanges();
        if (
          consts.outlineAutoScrollToSelected &&
          data.source !== StateChangedSource.Outline
        ) {
          this.scrollToSelected();
        }
      });

    this.cdRef.detectChanges();
  }

  expandSelected() {
    this.selectionService.getSelected().forEach((node) => {
      this.outlineService.expandToTop(node);
    });
  }
  scrollToSelected() {
    if (this.element && this.element.nativeElement) {
      setTimeout(() => {
        const element = this.element.nativeElement.querySelector(
          ".selected"
        ) as HTMLElement;
        if (
          element &&
          !Utils.isVisibleVertically(element, this.treeScroll.nativeElement)
        ) {
          element.scrollIntoView({
            behavior: "auto",
            block: "center",
            inline: "center",
          });
        }
      }, this.smallDebounce);
    }
  }

  public setSize(args: TimelineScrollEvent) {
    let changed = false;
    if (this.scrollTop !== args.scrollTop) {
      this.scrollTop = args.scrollTop;
      changed = true;
    }
    const headerHeight = args.scrollHeight - consts.timelineHeaderHeight;
    if (this.height !== headerHeight) {
      this.height = headerHeight;
      changed = true;
    }
    if (changed) {
      this.cdRef.detectChanges();
    }
  }
}
