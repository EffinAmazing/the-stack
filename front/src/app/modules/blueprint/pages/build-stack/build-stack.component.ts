import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { Tool, BluePrintTool, BluePrint } from '../../../../shared/models/tool';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3';

@Component({
  selector: 'app-build-stack',
  templateUrl: './build-stack.component.html',
  styleUrls: ['./build-stack.component.scss']
})
export class BuildStackComponent implements OnInit {
  @ViewChild('stackWorkFlow') stackWorkFlow: ElementRef;
  blueprint: BluePrint;
  nodes: BluePrintTool[] = [];
  nodesList: string[] = [];
  showNodes: BluePrintTool[] = [];
  categories: any = { "None": [] };
  changedNodes$: BehaviorSubject<any> = new BehaviorSubject({});
  changedArrows$: BehaviorSubject<any> = new BehaviorSubject([]);
  nodesForUpdate: any = [];
  hideList = true;
  loaded = false;
  domain = '';
  isError = false;
  errMessage = 'Something went wrong plaese check domain and try again';

  constructor(private service: BlueprintsService, private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe((params: any) => {
      this.domain = params.domain;
    });
  }

  ngOnInit(): void {
    if (this.domain) {
      this.service.getDomainTools(this.domain).subscribe((data) => {
        console.log(data);
        let hidden = 0;
        this.blueprint = data.blueprint;
        data.nodes.forEach((item) => {
          const tool = data.tools.find((atool) =>  atool.id === item.toolId );
          item.tool = tool;
          this.nodes[item.id] = item;
          this.nodesList.push(item.id);
          if (item.hide ) { hidden++; }
          if (item.tool.categories) {
            item.tool.categories.forEach((cat) => {
              if (this.categories[cat]) {
                this.categories[cat].push(item.id);
              } else {
                this.categories[cat] = [ item.id ];
              }
            });
          } else {
            this.categories['None'].push(item.id);
          }
          /*if (!item.hide) {
            this.showNodes.push(item);
          }*/
        });

        if (data.nodes.length - hidden > 50) {
          this.proceedNodes(data.nodes.length, hidden);
        } else {
          this.completedProceedNodes();
        }
        // console.log(this.nodes, this.nodes.length);
      }, err => this.isError = true );

    } else {
      this.isError = true;
    }
  }

  private proceedNodes(all, hidden, force?) {
    if (force) {
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        if (!item.hide && all - hidden > 50 ) {

          if (item.tool.categories[0].search('Analytics') === -1 && item.tool.name !== this.domain) {
            item.hide = true;
            hidden++;
            this.nodesForUpdate.push(item.id);
          }
        }
      });

      this.completedProceedNodes();
    } else {
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        if (!item.tool.categories && !item.hide) {
          item.hide = true;
          this.nodesForUpdate.push(item.id);
          hidden++;
        }
      });

      if (all - hidden <= 50) {
        this.completedProceedNodes();
      } else {
        console.log("force");
        this.proceedNodes(all, hidden, true);
      }
    }
  }

  public updatedNodePosiotion(data) {
    console.log('aaa', data);
    this.service.updateNodeTool(data.nodeId, { position: data.position }).subscribe((res) => {
      const tool = this.nodes[data.nodeId].tool;
      res.tool = this.nodes[data.nodeId].tool;
      this.nodes[data.nodeId] = res;
    });
  }

  private completedProceedNodes() {
    console.log(this.nodesForUpdate);
    this.loaded = true;
    if (this.nodesForUpdate.length) {
      this.service.hideNodes(this.nodesForUpdate).subscribe((data) => {
        this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });

        this.getArrowsList();
      });
    } else {
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });
      this.getArrowsList();
    }
  }

  private getArrowsList() {
    // 
    if (this.blueprint.id) {
      this.service.getArrows(this.blueprint.id).subscribe((data) => {
        this.changedArrows$.next(data);
      });
    }
  }

  public moveToHome() {
    this.router.navigateByUrl('/home');
  }

  public handleHideList() {
    this.hideList = !this.hideList;
  }

  public handleHideNodeItem(data: BluePrintTool) {
    if (!data.hide) {
      data['hide'] = true;
    } else {
      data.hide = false;
    }

    this.service.updateNodeTool(data.id, { hide: data.hide }).subscribe((res) => {
      // const nodeIndex = this.nodes.findIndex((item) => item.id = res.id );
      res.tool = this.nodes[data.id].tool;
      this.nodes[data.id] = res;
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList  });
      // this.margeShowNodes();
    });
  }

  public handleAddArrow(data) {
    console.log(data);
    this.service.addArrow(this.blueprint.id, data).toPromise().then((result) => {
      console.log(result);
    }).catch(err => console.log(err));
  }

  public handleUpdateArrow(data) {
    console.log(data);
    this.service.updateArrow(data).toPromise().then((result) => {
      console.log(result);
    }).catch(err => console.log(err));
  }

  private margeShowNodes() {
    this.showNodes = [];
    this.nodes.forEach((item) => {
      if (!item.hide) {
        this.showNodes.push(item);
      }
    });
  }


}
