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

  constructor(private service: BlueprintsService) { 

  }

  ngOnInit(): void {
    this.service.getDomainTools("effinamazing.com").subscribe((tools)=>{
      console.log(tools);
      tools.forEach((item)=>{
        this.nodes.push({
          blueprintId: "",
          toolId: "",
          tool: item
        });
      })
    });
  }

}
