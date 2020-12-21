import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Show messages in the player window.
 */
@Injectable({
  providedIn: "root",
})
export class NotificationService {
  notificationSubject = new BehaviorSubject<string | null>(null);
  constructor() {}

  hideMessage() {
    this.notificationSubject.next(null);
  }
  showMessage(message: string) {
    this.notificationSubject.next(message);
  }
}
