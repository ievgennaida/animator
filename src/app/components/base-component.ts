import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  /*
  // Debug updates count:
  static i = 0;
  ngAfterViewChecked() {
    BaseComponent.i++;
    console.log(BaseComponent.i + this.constructor.name + ": AfterViewChecked");
  } */
}
