import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tools-list',
  templateUrl: './tools-list.component.html',
  styleUrls: ['./tools-list.component.scss']
})
export class ToolsListComponent implements OnInit {
  @Input() loadedNodes: Observable<any>;
  @Input() loadedCategories: Observable<any>;
  @Output() toogleVisibilityNode: EventEmitter<any> = new EventEmitter();
  @Output() closeTools: EventEmitter<any> = new EventEmitter();
  categories: any;
  categoriesList: Array<any> = [];
  nodes: any = {};

  constructor() { }

  ngOnInit(): void {
    this.loadedNodes.subscribe((data) => {
      this.nodes = data.nodes;
    });

    this.loadedCategories.subscribe((data) => {
      const categories = Object.keys(data);

      for (const iterator of categories) {
        console.log(data[iterator]);
        this.categoriesList.push({
          name: iterator,
          nodes: data[iterator]
        });
      }
    });

  }

  public toggleNodeFormStack(node) {
    this.toogleVisibilityNode.emit(node);
  }

  public close() {
    this.closeTools.emit(true);
  }

}
