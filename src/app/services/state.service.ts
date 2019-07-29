import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  panelResized$ = new Subject();
  dataLoaded$ = new Subject();

  constructor() { }

  public get panelResize(): Observable<any> {
    return this.panelResized$.asObservable();
  }

  public onPanelResized() {
    this.panelResized$.next();
  }

 
  public get dataLoaded(): Observable<any> {
    return this.dataLoaded$.asObservable();
  }

  public onJsonLoaded(data) {
    this.dataLoaded$.next(data);
  }

}
