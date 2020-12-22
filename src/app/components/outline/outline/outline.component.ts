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
        if (data.source !== StateChangedSource.Outline) {
          if (this.element && this.element.nativeElement) {
            setTimeout(() => {
              const element = this.element.nativeElement.querySelector(
                ".selected"
              ) as HTMLElement;
              if (
                element &&
                !this.isVisibleInScroll(element, this.treeScroll.nativeElement)
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
      });
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
