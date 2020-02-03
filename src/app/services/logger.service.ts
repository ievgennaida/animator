import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: "root"
})
export class LoggerService {
  constructor() {}

  log(str) {
    if (str && !environment.production) {
      console.log(str);
    }
  }
}
