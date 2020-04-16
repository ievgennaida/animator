import { Subject } from "rxjs";
import { OnDestroy } from "@angular/core";

export class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject();
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.destroyed$ = null;
  }
}
