import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from "@angular/core";
import { ViewService } from "src/app/services/view.service";
import { DocumentService } from "src/app/services/document.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { InputDocument } from "src/app/models/input-document";

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutputComponent implements OnInit, OnDestroy {
  output = "";
  private destroyed$ = new Subject();
  constructor(
    private viewService: ViewService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.documentService.document
      .pipe(takeUntil(this.destroyed$))
      .subscribe((document: InputDocument) => {
        if (document && document.parsedData && document.parsedData.outerHTML) {
          this.output = document.parsedData.outerHTML;
        } else {
          this.output = "";
        }
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
