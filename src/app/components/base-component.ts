import { Subject } from "rxjs";
import { OnDestroy, Directive } from "@angular/core";

@Directive()
export class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject();
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.destroyed$ = null;
  }
 /*
  // Debug updates count:
  static i = 0;
  ngAfterViewChecked() {
    BaseComponent.i++;
    console.log(BaseComponent.i + this.constructor.name + ": AfterViewChecked");
  } */
}
