import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
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
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { MouseOverService } from "src/app/services/mouse-over.service";
import { OutlineService } from "src/app/services/outline.service";
import { SelectionService } from "src/app/services/selection.service";
import { StateChangedSource } from "src/app/services/state-subject";
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
    private window: Window,
    private mouseOverService: MouseOverService,
    private element: ElementRef<HTMLElement>
  ) {
    super();
    this.cdRef.detach();
  }

  maxAllowedHeight = this.window?.screen?.availHeight - 100 || 1000;
  @ViewChild("treeScroll", { static: true })
  treeScroll: CdkVirtualScrollViewport;
  @Input() allowScroll = false;
  scrollTop: any = 0;
  smallDebounce = 10;
  height: any = "";
  dataSource = this.outlineService.flatDataSource;
  treeControl = this.outlineService.treeControl;
  detectChangesSubject = new Subject();
  ngOnInit(): void {
    this.cdRef.detectChanges();
    this.selectionService.selected
      .pipe(
        takeUntil(this.destroyed$),
        // Debounce a bit to avoid stuck on click
        debounceTime(this.smallDebounce)
      )
      .subscribe((data) => {
        if (data && data.values) {
          data.values.forEach((node) => {
            this.outlineService.expandToTop(node);
          });
        }
        this.cdRef.detectChanges();
        if (
          consts.outlineAutoScrollToSelected &&
          data.source !== StateChangedSource.Outline
        ) {
          this.scrollToSelected();
        }
      });
    this.detectChangesSubject
      .pipe(
        takeUntil(this.destroyed$),
        // Debounce a bit to avoid stuck on scroll
        debounceTime(5)
      )
      .subscribe(() => this.cdRef.detectChanges());

    this.mouseOverService.mouseOver
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.cdRef.detectChanges());
    this.treeControl.expansionModel.changed
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.cdRef.detectChanges());
  }
  scrollChange() {
    this.detectChangesSubject.next();
  }
  collapseAll() {
    this.changeExpandedState(false);
  }
  expandAll() {
    this.changeExpandedState(true);
  }

  changeExpandedState(expectedExpanded: boolean): boolean {
    let changed = false;
    this.outlineService.getAllNodes().forEach((node) => {
      if (
        this.treeControl.isExpandable(node) &&
        this.treeControl.isExpanded(node) !== expectedExpanded
      ) {
        changed = true;
        if (expectedExpanded) {
          this.treeControl.expand(node);
        } else {
          this.treeControl.collapse(node);
        }
      }
    });
    if (changed) {
      this.cdRef.detectChanges();
    }

    return changed;
  }
  scrollToSelected() {
    if (this.element && this.element.nativeElement) {
      setTimeout(() => {
        const element = this.element.nativeElement.querySelector(
          ".selected"
        ) as HTMLElement;
        if (
          //element &&
          true
          // !this.isVisibleInScroll(element, this.treeScroll.nativeElement)
        ) {
          const node = this.selectionService.getSelected()[0];
          const nodes = this.dataSource._expandedData.getValue();
          const index = nodes.indexOf(node);
          if (index >= 0) {
            this.treeScroll.scrollToIndex(index);
          }
        }
      }, this.smallDebounce);
    }
  }
  /**
   * Check whether scroll into required.
   */
  public isVisibleInScroll(el: HTMLElement, container: HTMLElement) {
    if (
      !el ||
      !el.getBoundingClientRect ||
      !container ||
      !container.getBoundingClientRect
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const parentRect = container.getBoundingClientRect();
    if (!parentRect) {
      return;
    }
    // Contains partially:
    if (
      (rect.top > parentRect.top && rect.top < parentRect.bottom) ||
      (rect.bottom > parentRect.top && rect.bottom < parentRect.bottom)
    ) {
      return true;
    }
    return false;
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
