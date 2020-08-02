import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LoggerService {
  constructor() {}

  isDebug() {
    return !environment.debug;
  }
  log(str) {
    if (str && !environment.production) {
      console.log(str);
    }
  }

  error(str) {
    if (str && !environment.production) {
      console.error(str);
    }
  }

  warn(str) {
    if (str && !environment.production) {
      console.warn(str);
    }
  }
}
