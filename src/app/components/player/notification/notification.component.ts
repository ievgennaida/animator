import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { NotificationService } from "src/app/services/notification.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent extends BaseComponent implements OnInit {
  message: string | null = null;
  constructor(
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.cdRef.detach();
  }

  ngOnInit(): void {
    this.notificationService.notificationSubject
      .asObservable()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message) => {
        if (this.message !== message) {
          this.message = message;
          this.cdRef.detectChanges();
        }
      });
  }
}
