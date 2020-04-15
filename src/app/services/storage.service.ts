import { Injectable } from '@angular/core';
import { consts } from 'src/environments/consts';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }
  menuSize= consts.appearance.menuPanelSize
  propExpanded = true;
  outlineExpanded = true;
}
