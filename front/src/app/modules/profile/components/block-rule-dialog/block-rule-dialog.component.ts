import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface BlockRuleDialogData {
  kind: 'category' | 'tag';
  name: string;
  tools: number;
  alsoWhitelisted: number;
}

@Component({
  selector: 'app-block-rule-dialog',
  templateUrl: './block-rule-dialog.component.html',
  styleUrls: ['./block-rule-dialog.component.scss']
})
export class BlockRuleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BlockRuleDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: BlockRuleDialogData) { }
}
