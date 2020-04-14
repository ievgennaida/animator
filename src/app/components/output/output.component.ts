import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Inject,
  ElementRef,
  ViewChild,
  NgZone,
} from "@angular/core";
import { ViewService } from "src/app/services/view.service";
import { DocumentService } from "src/app/services/document.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { InputDocument } from "src/app/models/input-document";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutputComponent implements OnInit, OnDestroy {
  @ViewChild("code", { static: true })
  codeRef: ElementRef<HTMLElement>;
  private destroyed$ = new Subject();
  constructor(
    private viewService: ViewService,
    private documentService: DocumentService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.documentService.document
      .pipe(takeUntil(this.destroyed$))
      .subscribe((document: InputDocument) => {
        this.ngZone.runOutsideAngular(() => {
          if (
            document &&
            document.parsedData &&
            document.parsedData.outerHTML
          ) {
            // hilight element
            if (this.codeRef && this.codeRef.nativeElement) {
              this.codeRef.nativeElement.innerText =
                document.parsedData.outerHTML;
              // TODO: use webworker
              const w: any = window;
              if (w.hljs) {
                w.hljs.highlightBlock(this.codeRef.nativeElement);
              }
            }
          } else {
            if (this.codeRef && this.codeRef.nativeElement) {
              this.codeRef.nativeElement.innerText = "";
            }
          }
        });
      });
  }

  close() {
    this.viewService.toogleCode();
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
