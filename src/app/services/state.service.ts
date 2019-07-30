import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { TreeNode } from '../models/TreeNode';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  resizeSubject = new Subject();
  dataSubject = new Subject();
  nodesSubject = new BehaviorSubject<TreeNode[]>([]);
  constructor() { }

  public get onResize(): Observable<any> {
    return this.resizeSubject.asObservable();
  }

  public setPanelResized() {
    this.resizeSubject.next();
  }

  public get nodes(): Observable<any> {
    return this.nodesSubject.asObservable();
  }
  public get data(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  public setData(data) {
    this.dataSubject.next(data);
  }


  public onDataParsed(data: any) {
    
    if (!data || !data.layers) {
      this.nodesSubject.next(this.nodesSubject.value);
      return;
    }

    let treeNodes = this.nodesSubject.value;
    treeNodes.length = 0;
    treeNodes.push({
      name: 'hell '
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    treeNodes.push({
      name: 'hello'
    } as TreeNode);
    //let layers = data.layers;

    this.nodesSubject.next(treeNodes);
  }

}
