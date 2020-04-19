import { Injectable } from '@angular/core';
import { consts } from 'src/environments/consts';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }
  menuPanelSize= consts.appearance.menuPanelSize;
  resizedOutline = 0;
  propExpanded = true;
  outlineExpanded = true;
}
