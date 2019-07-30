import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { StateService } from 'src/app/services/state.service';
import { Subject } from 'rxjs';
import { TreeNode } from 'src/app/models/TreeNode';
import { takeUntil } from 'rxjs/operators';

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent implements OnInit, OnDestroy {
  constructor(private stateService: StateService) {

  }

  private destroyed$ = new Subject();
  ngOnInit(): void {
    this.stateService.nodes
      .pipe(takeUntil(this.destroyed$)).subscribe(p => {
        this.dataSource.data = p;
      })
  }

  setScroll(args:any){
    alert('set')
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  activeNode: any;
  private _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  doubleClick() {
    //alert('db click');
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}