import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { hiddenCategories } from '../../../../core/config';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

const host = environment.serverURI;

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
  categoriesList: Array<{
    name: string,
    nodes: string[],
    needToBeCollapsed: boolean
  }> = [];
  nodes: any = {};

  constructor() { }

  ngOnInit(): void {
    this.loadedNodes.subscribe((data) => {
      this.nodes = data.nodes;
    });


    this.loadedCategories.subscribe((data) => {
      const categories = Object.keys(data);
      const collapsedArray = [];
      for (const iterator of categories) {
        // console.log(data[iterator]);
        const lowerCase = iterator.toLocaleLowerCase();
        const needToBeCollapsed = hiddenCategories.includes(iterator);
        const item = {
          name: iterator,
          nodes: data[iterator],
          needToBeCollapsed
        }
        if (lowerCase !== 'none') {
          if (needToBeCollapsed) {
            if ( lowerCase.indexOf('analytic') !== -1 ||
              lowerCase.indexOf('tracking') !== -1 ||
              lowerCase.indexOf('marketing') !== -1 ) {
              this.categoriesList.unshift(item);
            } else {
              this.categoriesList.push(item);
            }
          } else {
            collapsedArray.push(item);
          }
        }
      }

      this.categoriesList = [...collapsedArray, ...this.categoriesList ];

      this.categoriesList.unshift({
        name: 'None',
        nodes: data['None'],
        needToBeCollapsed: hiddenCategories.includes('None')
      });
    });

  }

  public toggleNodeFormStack(node) {
    this.toogleVisibilityNode.emit(node);
  }

  public close() {
    this.closeTools.emit(true);
  }

  public processImageSrc(link) {
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

}
