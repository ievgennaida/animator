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

import { InputDocument } from "src/app/models/input-document";

import { BaseComponent } from "../base-component";

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutputComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  @ViewChild("code", { static: true })
  codeRef: ElementRef<HTMLElement> | null = null;
  constructor(
    private viewService: ViewService,
    private documentService: DocumentService,
    private ngZone: NgZone
  ) {
    super();
  }

  ngOnInit(): void {
    this.documentService.documentSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((document) => {
        this.ngZone.runOutsideAngular(() => {
          if (
            document &&
            document.parsedData &&
            document.parsedData.outerHTML
          ) {
            // highlight element
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
    this.viewService.toggleCode();
  }
}
