import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LoggerService {
  constructor() {}

  isDebug(): boolean {
    return environment.debug || (location?.hash || "").includes("debug");
  }
  debug(str: string): void {
    if (this.isDebug()) {
      this.log(str);
    }
  }
  log(str: string): void {
    if (str && !environment.production) {
      console.log(str);
    }
  }

  error(str: string): void {
    if (str && !environment.production) {
      console.error(str);
    }
  }

  warn(str: string): void {
    if (str && !environment.production) {
      console.warn(str);
    }
  }
}
