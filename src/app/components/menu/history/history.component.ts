import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { BaseAction } from "src/app/services/actions/base-action";
import { LoggerService } from "src/app/services/logger.service";
import { UndoService } from "src/app/services/undo.service";
import { Utils } from "src/app/services/utils/utils";
import { BaseComponent } from "../../base-component";

interface HistoryItem {
  command: BaseAction;
  active: boolean;
  hover: boolean;
  selected: boolean;
}

@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent extends BaseComponent implements OnInit {
  constructor(
    private undoService: UndoService,
    private cdRef: ChangeDetectorRef,
    private logger: LoggerService
  ) {
    super();
    this.cdRef.detach();
  }
  @ViewChild("virtual", { static: true, read: ElementRef })
  virtualElementRef: ElementRef<HTMLElement>;
  nextTickTimeout = 10;
  @ViewChild("virtual", { static: true }) virtual: CdkVirtualScrollViewport;
  items: HistoryItem[] = [];
  ngOnInit(): void {
    this.virtual?.renderedRangeStream
      ?.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.cdRef.detectChanges();
      });
    this.undoService.actionIndexSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((activeIndex) => {
        this.updateHoverAndSelectedEffects();
        setTimeout(() => {
          this.scrollToSelectedIndex(activeIndex);
        }, this.nextTickTimeout);
      });
    this.undoService.actionsSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.updateItems();
      });

    // Bug with virtual scroll viewport, should be updated on next tick.
    setTimeout(() => {
      this.cdRef.detectChanges();
      this.scrollToSelectedIndex(this.undoService.activeIndex);
    }, this.nextTickTimeout);
  }
  updateItems() {
    const itemsCountChanged =
      this.items.length !== this.undoService.actions.length;
    this.items = this.undoService.actions.map((p, index) => {
      return {
        command: p,
        active: this.undoService.activeIndex >= index,
        hover: false,
        selected: this.undoService.activeIndex === index,
      } as HistoryItem;
    });
    if (itemsCountChanged) {
      this.scrollToEnd();
    }
    this.cdRef.detectChanges();
  }
  onScrolled() {
    this.cdRef.detectChanges();
  }
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  updateHoverAndSelectedEffects(hoverIndex: number | null = null) {
    const activeIndex = this.undoService.activeIndex;
    this.items.forEach((p, index) => {
      p.selected = activeIndex === index;
      p.active = activeIndex >= index;
      p.hover = false;
      if (hoverIndex !== null && hoverIndex !== -1) {
        if (activeIndex >= hoverIndex) {
          p.hover = hoverIndex <= index && index <= activeIndex;
        } else {
          p.hover = activeIndex <= index && hoverIndex >= index;
        }
      }
    });
    this.cdRef.detectChanges();
  }

  /**
   * Scroll only if active selected index is not visible.
   */
  scrollToSelectedIndex(index: number): void {
    const container = this.virtualElementRef?.nativeElement;
    if (!this.virtual || !container) {
      console.log("Error: virtual list is not defined.");
      return;
    }
    const element = container.querySelector(".selected") as HTMLElement;
    if (!Utils.isVisibleVertically(element, container)) {
      // execute after angular data binding
      this.virtual.scrollToIndex(index);
      this.cdRef.detectChanges();
    }
  }

  scrollToEnd() {
    // execute after angular data binding
    setTimeout(() => {
      this.virtual.scrollToOffset(Number.MAX_SAFE_INTEGER);
      this.cdRef.detectChanges();
    }, this.nextTickTimeout);
  }
  historyClick(action: HistoryItem) {
    if (!action || !action.command) {
      this.logger.error(
        "HistoryComponent->historyClick action or command cannot be empty"
      );
      return;
    }
    this.undoService.goToAction(action.command);
  }

  mouseEnter(action: HistoryItem) {
    this.updateHoverAndSelectedEffects(this.items.indexOf(action));
  }

  mouseLeave(action: HistoryItem) {
    this.updateHoverAndSelectedEffects();
  }
}
