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
  @ViewChild("virtual", { static: true, read: ElementRef })
  virtualElementRef: ElementRef<HTMLElement> | null = null;
  @ViewChild("virtual", { static: true })
  virtual: CdkVirtualScrollViewport | null = null;
  nextTickTimeout = 10;

  items: HistoryItem[] = [];
  constructor(
    private undoService: UndoService,
    private cdRef: ChangeDetectorRef,
    private logger: LoggerService
  ) {
    super();
    this.cdRef.detach();
  }
  ngOnInit(): void {
    this.virtual?.renderedRangeStream
      ?.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.cdRef.detectChanges();
      });
    this.undoService.actionIndexSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((activeIndex) => {
        this.updateHoverAndSelectedEffects();
        setTimeout(() => {
          this.scrollToSelectedIndex(activeIndex);
        }, this.nextTickTimeout);
      });
    this.undoService.actionsSubject
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
  updateItems(): void {
    const itemsCountChanged =
      this.items.length !== this.undoService.actions.length;
    this.items = this.undoService.actions.map(
      (p, index) =>
        ({
          command: p,
          active: this.undoService.activeIndex >= index,
          hover: false,
          selected: this.undoService.activeIndex === index,
        } as HistoryItem)
    );
    if (itemsCountChanged) {
      this.scrollToEnd();
    }
    this.cdRef.detectChanges();
  }
  onScrolled(): void {
    this.cdRef.detectChanges();
  }
  onRightClick(event: MouseEvent): void {
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
    if (!this.virtual || !container || !this.virtual.scrollToIndex) {
      // Can happens during the tests.
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

  scrollToEnd(): void {
    if (!this.virtual) {
      return;
    }
    // execute after angular data binding
    setTimeout(() => {
      if (!this.virtual) {
        return;
      }
      this.virtual.scrollToOffset(Number.MAX_SAFE_INTEGER);
      this.cdRef.detectChanges();
    }, this.nextTickTimeout);
  }
  historyClick(action: HistoryItem): void {
    if (!action || !action.command) {
      this.logger.error(
        "HistoryComponent->historyClick action or command cannot be empty"
      );
      return;
    }
    this.undoService.goToAction(action.command);
  }

  mouseEnter(action: HistoryItem): void {
    this.updateHoverAndSelectedEffects(this.items.indexOf(action));
  }

  mouseLeave(action: HistoryItem): void {
    this.updateHoverAndSelectedEffects();
  }
}
