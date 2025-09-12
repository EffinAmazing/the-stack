import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { MatDialog } from '@angular/material/dialog';
import { NodeDetailsComponent } from '../node-details/node-details.component';
import { hiddenCategories, WhitelistCategories } from '../../../../core/config';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ConfirmActionDialogComponent } from '../../../../shared/components/confirm-action-dialog/confirm-action-dialog.component';

const host = environment.serverURI;

@Component({
  selector: 'app-tools-list',
  templateUrl: './tools-list.component.html',
  styleUrls: ['./tools-list.component.scss']
})
export class ToolsListComponent implements OnInit {
  @Input() loadedNodes: Observable<any>;
  @Input() loadedCategories: Observable<any>;
  @Input() updatedOutNodeData: Observable<BluePrintTool | null>;
  @Input() addedNewNode: Observable<BluePrintTool[] | null>;
  @Output() toogleVisibilityNode: EventEmitter<any> = new EventEmitter();
  @Output() toogleGlobalVisibilityNode: EventEmitter<any> = new EventEmitter();
  @Output() closeTools: EventEmitter<any> = new EventEmitter();
  @Output() updatedNodeData: EventEmitter<{ nodeId: string, data: BluePrintTool }> = new EventEmitter();
  @Output() callEditNode: EventEmitter<string> = new EventEmitter();
  categories: any;
  totalCost: number;
  categoriesList: Array<{
    name: string,
    nodes: string[],
    cost?: number,
    needToBeCollapsed: boolean
  }> = [];
  nodes: any = [];
  editStates: { [key: string]: { start: boolean, end: boolean, cost: boolean, owner: boolean } } = {};
  currentNodeEdit: BluePrintTool | null = null;
  copyBeforeStart: BluePrintTool | null = null;
  isUserAdmin: Boolean;
  globalHiddenTools: Tool[] = [];

  constructor(private detailsDialog: MatDialog, private confirm: MatDialog, public auth: AuthService) { }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) this.isUserAdmin = user.role === 0;
    this.totalCost = 0;
    this.loadedNodes.subscribe((data) => {

      this.nodes = data.nodes;

      for (const key in this.nodes) {
        const node = this.nodes[key];        
      }  

      for (const key in data.nodes) {
        if (data.nodes.hasOwnProperty(key)) {
          this.editStates[data.nodes[key].id] = { start: false, end: false, cost: false, owner: false };
        }
      }      

    });

    this.addedNewNode.subscribe((nodes) => {
      console.log('addedNodes', nodes)
      if (!nodes || !nodes.length) return;

      let categoriesChanged = false;

      nodes.forEach(item => {

        // Ensure node exists in nodes
        if (!this.nodes[item.id]) {
          this.nodes[item.id] = item;          
        } else {
          // If node was already loaded, make sure it's visible
          this.nodes[item.id].hide = false;
        }

        // Initialize editStates for the new node
        this.editStates[item.id] = { start: false, end: false, cost: false, owner: false };

        // Update categoriesList
        // Update categoriesList
        const nodeCategories = (item.tool.categories && item.tool.categories.length) 
          ? item.tool.categories 
          : ['None'];

        nodeCategories.forEach(cat => {
          const index = this.categoriesList.findIndex(ctItem => ctItem.name === cat);
          if (index !== -1) {
            if (!this.categoriesList[index].nodes.includes(item.id)) {
              const nodesArr = this.categoriesList[index].nodes;
              const newId = item.id;
              const newName = item.tool?.name || '';

              // find the LAST index whose node's tool.name matches newName
              let lastMatchIndex = -1;
              for (let i = nodesArr.length - 1; i >= 0; i--) {
                const existingNode = this.nodes[nodesArr[i]];
                if (existingNode?.tool?.name === newName) {
                  lastMatchIndex = i;
                  break;
                }
              }

              if (lastMatchIndex === -1) {
                nodesArr.push(newId);
              } else {
                nodesArr.splice(lastMatchIndex + 1, 0, newId);
              }

              categoriesChanged = true;
            }
          } else {
            this.categoriesList.push({
              name: cat,
              nodes: [item.id],
              cost: 0,
              needToBeCollapsed: cat !== 'None' && hiddenCategories.includes(cat)
            });
            categoriesChanged = true;
          }
        });
      });

      


      // 4. Recalculate costs for any categories that changed
      if (categoriesChanged) {
        this.categoriesList.forEach(cat => this.reculcCategoryCost(cat.name));
      }

      // 5. Recalculate total cost
      this.reculcAllCost();
    });



    const checkIsAdded: {[key: string]: boolean} = { };

    this.loadedCategories.subscribe((data) => {
      console.log('cats',data);
      const categories = Object.keys(data);
      const collapsedArray = [];
      const whitelist = [];
      let none: any;
      for (const iterator of categories) {
        const lowerCase = iterator.toLocaleLowerCase();
        const needToBeCollapsed = hiddenCategories.includes(iterator);
        const item = {
          name: iterator,
          nodes: data[iterator],
          cost: 0,
          needToBeCollapsed
        };

        this.sortCategoryNodes(item.nodes);

        let catCost = 0;
        data[iterator].forEach(nodeId => {
          if (!checkIsAdded[nodeId]) {
            this.totalCost += this.nodes[nodeId].cost ? this.nodes[nodeId].cost : 0;
            checkIsAdded[nodeId] = true;
          }
          catCost += this.nodes[nodeId].cost ? this.nodes[nodeId].cost : 0;
        });
        item.cost = catCost;

        if (lowerCase !== 'none') {
          if (!needToBeCollapsed) {
            if ( WhitelistCategories.includes(iterator) ) {
              whitelist.push(item);
            } else {
              this.categoriesList.push(item);
            }
          } else {
            collapsedArray.push(item);
          }
        } else {
          none = item;
        }
      }

      whitelist.sort((a, b) => {
        const indexA = WhitelistCategories.indexOf(a.name);
        const indexB = WhitelistCategories.indexOf(b.name);

        if (indexA < indexB) {return -1; }
        if (indexA > indexB) {return 1; }
        return 0;
      });
      if (none) {
        this.categoriesList.push(none);
      }

      this.categoriesList = [...whitelist, ...this.categoriesList, ...collapsedArray];
    });

    this.updatedOutNodeData.subscribe((node) => {
      if (node) {
        if (node.tool && node.tool.categories) {
          node.tool.categories.forEach((cat) => {
            this.reculcCategoryCost(cat);
          });
        }
      }
    });

  }

  private sortCategoryNodes(nodesArr: string[]): void {
    nodesArr.sort((a, b) => {
      const nameA = this.nodes[a]?.tool?.name?.toLowerCase() || '';
      const nameB = this.nodes[b]?.tool?.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }

  public handleClickToEdit(nodeId: string, field: string) {
    if (this.currentNodeEdit) {
      if (this.currentNodeEdit.id !== nodeId) {
        this.editStates[this.currentNodeEdit.id] = { start: false, end: false, cost: false, owner: false };
        this.currentNodeEdit = this.nodes[nodeId];
      }
    } else {
      this.currentNodeEdit = this.nodes[nodeId];
    }

    if (!this.copyBeforeStart) {
      this.copyBeforeStart = Object.assign({}, this.nodes[nodeId]);
    } else if (this.copyBeforeStart.id !== nodeId) {
      this.copyBeforeStart = Object.assign({}, this.nodes[nodeId]);
    }

    this.editStates[nodeId][field] = true;
  }

  public confirmUpdates(nodeId: string, field: string) {
    if (this.editStates[nodeId]) {
      this.editStates[nodeId][field] = false;
      this.copyBeforeStart[field] = Object.assign({}, this.nodes[nodeId]);

      if (field === 'cost') {
        this.nodes[nodeId].tool.categories.forEach((cat) => {
          this.reculcCategoryCost(cat);
        });

        this.reculcAllCost();
      }

      this.updatedNodeData.emit({ nodeId, data: this.nodes[nodeId] });
    }
  }

  public cancelUpdates(nodeId: string, field: string) {
    if (this.editStates[nodeId]) {
      this.editStates[nodeId][field] = false;
      this.nodes[nodeId] = this.copyBeforeStart;
    }
  }

  private getAddedAndRemovedItems(prevArr: Array<number | string>, nextArr: Array<number | string>): {
      added: Array<number | string>, removed: Array<number | string> } {
    const added = [];
    const removed = [];

    prevArr.forEach(item => {
      if ( nextArr.indexOf( item ) === -1) {
        removed.push(item);
      }
    });

    nextArr.forEach(item => {
      if (prevArr.length === 0 || prevArr.indexOf(item) === -1) {
        added.push(item);
      }
    });

    return {
      added,
      removed
    };
  }

  public handleClickInfo(node) {

    const dialogRef = this.detailsDialog.open(NodeDetailsComponent, {
      width: '620px',
      data: { node }
    });

    window['dataLayer'].push({
      event: 'stackbuilder.node.openInfo',
      node,
      tool: node.tool,
      via: 'table'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (typeof result === 'string') {
          this.callEditNode.emit(result);
        } else {
          node = Object.assign({}, node, result);

          console.log('result.cost', result.cost, node.cost );
          if (result.cost !== node.cost) {
            window['dataLayer'].push({
              event: 'stackbuilder.node.updateCost',
              oldCost: node.cost,
              newCost: result.cost,
              tool: node.tool,
              node
            });
          }

          console.log('result.owner', result.owner, node.owner );
          if (result.owner !== node.owner) {
            const ownersUpdates = this.getAddedAndRemovedItems(node.owner ? node.owner.split(',') : [], result.owner.split(','));
            ownersUpdates.added.forEach(item => {
              window['dataLayer'].push({
                event: 'stackbuilder.node.addedOwner',
                tool: node.tool,
                email: item,
                node
              });
            });

            ownersUpdates.removed.forEach(item => {
              if (item) {
                window['dataLayer'].push({
                  event: 'stackbuilder.node.removedOwner',
                  tool: node.tool,
                  email: item,
                  node
                });
              }
            });
          }

          console.log('result.trainedOn', result.trainedOn, node.trainedOn );
          if ( result.trainedOn !==  node.trainedOn) {
            const usersUpdates = this.getAddedAndRemovedItems(node.trainedOn ? node.trainedOn.split(',') : [],
              result.trainedOn.split(','));
            usersUpdates.added.forEach(item => {
              window['dataLayer'].push({
                event: 'stackbuilder.node.addedUser',
                tool: node.tool,
                email: item,
                node
              });
            });

            usersUpdates.removed.forEach(item => {
              if ( item ) {
                window['dataLayer'].push({
                  event: 'stackbuilder.node.removedUser',
                  tool: node.tool,
                  email: item,
                  node
                });
              }
            });
          }

          this.nodes[node.id] = node;
          node.tool.categories.forEach((cat) => {
            this.reculcCategoryCost(cat);
          });

          this.reculcAllCost();
          /* */
          this.updatedNodeData.emit({ nodeId: node.id, data: result });
        }
      }
    });
  }

  private reculcCategoryCost(name) {
    const indexCat = this.categoriesList.findIndex((catItem) => catItem.name === name);
    let cost = 0;
    this.categoriesList[indexCat].nodes.forEach((item) => {
      cost += this.nodes[item].cost ? this.nodes[item].cost : 0;
    });

    this.categoriesList[indexCat].cost = cost;
  }

  private reculcAllCost() {
    this.totalCost = 0;

    for (const key in this.nodes) {
      if (this.nodes.hasOwnProperty(key)) {
        this.totalCost += this.nodes[key].cost ? this.nodes[key].cost : 0;
      }
    }
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  public toggleNodeFormStack(node) {
    this.toogleVisibilityNode.emit({ item: node, disableHistory: true });
  }

  public toggleNodeGlobally(node) {    

    let label = "Hide";
    let isHidden = false;
    if (node.hiddenGlobally) {
      label = "Show";
      isHidden = true;
    }

    const dialogRef = this.confirm.open(ConfirmActionDialogComponent, {
      width: '480px',
      data: { title: label + ' tool globally',  content: 'This will ' + label.toLowerCase() + ' this tool for all users: ' + this.nodes[node.id].tool.name + '. Proceed?'}
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {   

        node.hide = isHidden;

        this.toogleVisibilityNode.emit({ item: node, disableHistory: true });  
        this.toogleGlobalVisibilityNode.emit({ item: node, disableHistory: true, isHidden: isHidden });
      }
    });
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
