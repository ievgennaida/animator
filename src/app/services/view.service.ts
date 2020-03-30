import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { consts } from 'src/environments/consts';

@Injectable({
  providedIn: 'root'
})
export class ViewService {

  constructor() {
  }

  viewPropertiesSubject = new BehaviorSubject<boolean>(consts.appearance.propertiesOpened);

  toogleProperties(){
    this.viewPropertiesSubject.next(!this.viewPropertiesSubject.getValue());
  }
}
