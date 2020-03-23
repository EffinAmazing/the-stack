import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
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
        // console.log(data[iterator]);
        const lowerCase = iterator.toLocaleLowerCase();
        if ( lowerCase.indexOf('analytic') !== -1 ||  lowerCase.indexOf('tracking') || lowerCase.indexOf('marketing')) {
          this.categoriesList.unshift({
            name: iterator,
            nodes: data[iterator]
          });
        } else {
          this.categoriesList.push({
            name: iterator,
            nodes: data[iterator]
          });
        }
      }
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
