import { Component, OnInit } from '@angular/core';
import { BlueprintsService } from "../../../../core/services/blueprints.service";
import { Tool, BluePrintTool } from "../../../../shared/models/tool";

@Component({
  selector: 'app-build-stack',
  templateUrl: './build-stack.component.html',
  styleUrls: ['./build-stack.component.scss']
})
export class BuildStackComponent implements OnInit {
  nodes: BluePrintTool[] = [];
  showNodes: BluePrintTool[] = [];
  hideList: boolean = true;

  constructor(private service: BlueprintsService) { }

  ngOnInit(): void {
    this.service.getDomainTools("effinamazing.com").subscribe((data) => {
      console.log(data);
      data.nodes.forEach((item) => {
        const tool = data.tools.find((atool) =>  atool.id === item.toolId );
        item.tool = tool;
        this.nodes.push(item);
        if (!item.hide) {
          this.showNodes.push(item);
        }
      });

      console.log(this.showNodes);
    });
  }

  public relisedMove(data, node: BluePrintTool) {
    console.log(data.source._dragRef._activeTransform);

    this.service.updateNodeTool(node.id, { position: data.source._dragRef._activeTransform }).subscribe((res) => {
      const nodeIndex = this.nodes.findIndex((item) => item.id = res.id );
      const tool = this.nodes[nodeIndex].tool;
      this.nodes[nodeIndex] = res;
      this.nodes[nodeIndex]['tool'] = tool;
    });

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
      const nodeIndex = this.nodes.findIndex((item) => item.id = res.id );
      const tool = this.nodes[nodeIndex].tool;
      this.nodes[nodeIndex] = res;
      this.nodes[nodeIndex]['tool'] = tool;
      this.margeShowNodes();
    });
  }

  private margeShowNodes(){
    this.showNodes = [];
    this.nodes.forEach((item) => {
      if (!item.hide) {
        this.showNodes.push(item);
      }
    })
  }

}
