import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewService {

  constructor() {
  }

  viewPropertiesSubject = new BehaviorSubject<boolean>(true);

  toogleProperties(){
    this.viewPropertiesSubject.next(!this.viewPropertiesSubject.getValue());
  }
}
