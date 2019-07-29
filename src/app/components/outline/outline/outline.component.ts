  import {FlatTreeControl} from '@angular/cdk/tree';
  import {Component, OnInit} from '@angular/core';
  import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
  
  /**
   * Food data with nested structure.
   * Each node has a name and an optiona list of children.
   */
  interface FoodNode {
    name: string;
    children?: FoodNode[];
  }
  
  const TREE_DATA: FoodNode[] = [
    {
      name: 'Fruit awfaw awd wad awda wdaw awd adawd awd awda wdaw  afwa awda da wd awdaw daw awdaw daw w',
      children: [
        {name: 'Apple'},
        {name: 'Banana'},
        {name: 'Fruit loops'},
      ]
    }, {
      name: 'Vegetables',
      children: [
        {
          name: 'Green',
          children: [
            {name: 'Broccoli'},
            {name: 'Brussel sprouts'},
          ]
        }, {
          name: 'Orange',
          children: [
            {name: 'Pumpkins'},
            {name: 'Carrots'},
          ]
        },
      ]
    },
  ];
  
  /** Flat node with expandable and level information */
  interface ExampleFlatNode {
    expandable: boolean;
    name: string;
    level: number;
  }

  @Component({
    selector: 'app-outline',
    templateUrl: './outline.component.html',
    styleUrls: ['./outline.component.scss']
  })
  export class OutlineComponent implements OnInit {
    ngOnInit(): void {
     
    }
    activeNode:any;
    private _transformer = (node: FoodNode, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        level: level,
      };
    }
  
    treeControl = new FlatTreeControl<ExampleFlatNode>(
        node => node.level, node => node.expandable);
  
    treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);
  
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  
    constructor() {
      this.dataSource.data = TREE_DATA;
    }
    doubleClick(){
      alert('db click');
    }
    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  }