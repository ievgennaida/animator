import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject();
  ngOnDestroy(): void {
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
