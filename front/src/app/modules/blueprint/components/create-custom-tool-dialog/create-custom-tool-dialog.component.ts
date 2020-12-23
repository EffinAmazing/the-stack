import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';
import { ToolIconCropperComponent } from '../tool-icon-cropper/tool-icon-cropper.component';
import {Observable} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';

const host = environment.serverURI;

@Component({
  selector: 'app-create-custom-tool-dialog',
  templateUrl: './create-custom-tool-dialog.component.html',
  styleUrls: ['./create-custom-tool-dialog.component.scss']
})
export class CreateCustomToolDialogComponent {
  toolForm: FormGroup;
  ownerTemp = '';
  trainOnTemp = '';
  categoriesTemp = '';
  imageUpdated = false;
  isProcced = false;
  nodeResult = null;
  catOptions = [];
  filteredOptions: Observable<string[]> = new Observable();
  @ViewChild('iconImage') iconImage: ElementRef<HTMLImageElement>;
  @ViewChild('canvasForIcon') canvasForIcon: ElementRef<HTMLCanvasElement>;
  @ViewChild('cancelButton') cancelButton: ElementRef<HTMLButtonElement>;

  constructor( public dialogRef: MatDialogRef<CreateCustomToolDialogComponent>,
               private service: BlueprintsService,
               public cropperDialog: MatDialog,
               @Inject(MAT_DIALOG_DATA) public data: { blueprintId: string, node: BluePrintTool | void }) {
    this.toolForm = new FormGroup({
      name: new FormControl(data.node && data.node.tool && data.node.tool.name ? data.node.tool.name : '', [Validators.required]),
      categories: new FormControl(data.node && data.node.tool && data.node.tool.categories ? data.node.tool.categories.join(',') : ''),
      description: new FormControl(data.node && data.node.tool && data.node.tool.description ? data.node.tool.description : ''),
      link: new FormControl(data.node && data.node.tool && data.node.tool.link ? data.node.tool.link : ''),
      start: new FormControl(data.node && data.node.start ? data.node.start : '', []),
      end: new FormControl(data.node && data.node.end ? data.node.end : '', []),
      owner: new FormControl(data.node && data.node.owner ? data.node.owner : ''),
      cost: new FormControl(data.node && data.node.cost ? data.node.cost : ''),
      trainedOn: new FormControl(data.node && data.node.trainedOn ? data.node.trainedOn : '')
    });

    

    this.dialogRef.afterOpened().subscribe(() => {
      this.iconImage.nativeElement.addEventListener('load', (result) => {
        const ctx = this.canvasForIcon.nativeElement.getContext('2d');
        ctx.drawImage(this.iconImage.nativeElement, 0, 0, 73, 73);
      });

      if (this.iconImage.nativeElement.complete) {
        const ctx = this.canvasForIcon.nativeElement.getContext('2d');
        ctx.drawImage(this.iconImage.nativeElement, 0, 0, 73, 73);
      }

      /*this.filteredOptions = this.toolForm.get('categories').valueChanges.pipe(startWith(''), switchMap(value =>{
        console.log(value);
        return this.service.getCategories(value)
      }));*/
      this.filteredOptions = this.service.getCategories(this.categoriesTemp).pipe();
      // this.categoriesTemp
      //this.getCatList('');
    });
  }

  public processImageSrc(link) {
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

  public getImageUrl() {
    if (this.data.node && this.data.node.tool && this.data.node.tool.logo) {
      return host + this.data.node.tool.logo;
    } else {
      return this.getAssetsFolder() + 'assets/images/layers.png';
    }
  }

  public getCategories(): string[] {
    const categories = this.toolForm.get('categories').value;

    if ( categories === '' ) {
      return [];
    } else {
      return categories.split(',');
    }
  }

  public getOwners(): string[] {
    const owners = this.toolForm.get('owner').value;

    if (owners === '') {
      return [];
    } else {
      return owners.split(',');
    }
  }

  public getTrainedOn(): string[] {
    const trainedOn = this.toolForm.get('trainedOn').value;

    if (trainedOn === '') {
      return [];
    } else {
      return trainedOn.split(',');
    }
  }

  public addCategory(name: string): void {
    let categories = this.toolForm.get('categories').value;

    let list = categories.split(',');

    if (categories === '') {
      list = [];
    }

    const duplicat = list.find(item => item === name);
    if (!duplicat) {
      list.push(name);
    }

    categories = list.join(',');
    this.toolForm.get('categories').setValue(categories);
  }

  public addOwner(email: string): void {
    let owners = this.toolForm.get('owner').value;

    let list = owners.split(',');

    if (owners === '') {
      list = [];
    }

    const duplicat = list.find(item => item === email);
    if (!duplicat) {
      list.push(email);
    }

    owners = list.join(',');
    this.toolForm.get('owner').setValue(owners);
  }

  public addTrainedOn(email: string): void{
    let trainedOn = this.toolForm.get('trainedOn').value;

    let list = trainedOn.split(',');

    if (trainedOn === '') {
      list = [];
    }

    const duplicat = list.find(item => item === email);
    if (!duplicat) {
      list.push(email);
    }

    trainedOn = list.join(',');
    this.toolForm.get('trainedOn').setValue(trainedOn);
  }

  public removeCategory(name: string): void {
    let categories = this.toolForm.get('categories').value;
    const list = categories.split(',');
    const index = list.findIndex((item) => item === name);
    if (index !== -1) {
      list.splice(index, 1);
      categories =  list.join(',');
      this.toolForm.get('categories').setValue(categories);
    }
  }

  public removeOwner(email: string): void {
    let owners = this.toolForm.get('owner').value;
    const list = owners.split(',');
    const index = list.findIndex((item) => item === email);
    if (index !== -1) {
      list.splice(index, 1);
      owners =  list.join(',');
      this.toolForm.get('owner').setValue(owners);
    }
  }

  public removeTrainedOn(email: string) {
    let trainedOn = this.toolForm.get('trainedOn').value;
    const list = trainedOn.split(',');
    const index = list.findIndex((item) => item === email);
    console.log('index', index);
    if (index !== -1) {
      list.splice(index, 1);
      trainedOn =  list.join(',');
      this.toolForm.get('trainedOn').setValue(trainedOn);
    }
  }

  public handleAddCategory() {
    if ( this.categoriesTemp && this.categoriesTemp.length > 2 ) {
      this.addCategory(this.categoriesTemp);
      this.categoriesTemp = '';
    }
  }

  public handleAddOwner() {
    if ( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test( this.ownerTemp ) ) {
      this.addOwner(this.ownerTemp);
      this.ownerTemp = '';
    }

  }

  public handleAddTrainedOn() {
    if ( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test( this.trainOnTemp ) ) {
      this.addTrainedOn(this.trainOnTemp);
      this.trainOnTemp = '';
    }
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  private proceedFormSubmit(formData: FormData) {
    if (this.data.node) {
      formData.append('toolId', this.data.node.tool.id);
      this.service.updateCustom(this.data.node.id, formData).toPromise()
        .then(res => {
          this.dialogRef.close(res);
          setTimeout(() => {
            this.cancelButton.nativeElement.click();
          }, 1000 );
        })
        .catch(err => { console.log(err); });
    } else {
      this.service.createCustom(formData).toPromise()
      .then(res => {
        this.nodeResult = res;
        this.dialogRef.close(res);
        setTimeout(() => {
          this.cancelButton.nativeElement.click();
        }, 1000 );

      })
      .catch(err => { console.log(err); });
    }
  }

  public submitCreatingNewTool() {
    console.log(this.iconImage);
    if (this.toolForm.valid) {
      const formData = new FormData();
      const value = this.toolForm.value;
      if (value.name) { formData.append('tool[name]', value.name ); }
      if (value.categories) { formData.append('tool[categories]', value.categories.split(',')); }
      if (value.description) { formData.append('tool[description]', value.description); }
      if (value.link) { formData.append('tool[link]', value.link); }

      if (value.cost) { formData.append('node[cost]', value.cost); }
      if (value.start) { formData.append('node[start]', value.start); }
      if (value.end) { formData.append('node[end]', value.end); }
      if (value.owner) { formData.append('node[owner]', value.owner); }
      if (value.trainedOn) { formData.append('node[trainedOn]', value.trainedOn); }
      formData.append('node[blueprintId]', this.data.blueprintId);

      this.isProcced = true;
      if (!this.data.node || this.imageUpdated ) {
        this.canvasForIcon.nativeElement.toBlob((result) => {
          this.imageUpdated = false;
          formData.append('icon', result, 'icon.png');
          this.proceedFormSubmit(formData);
        });
      } else {
        this.proceedFormSubmit(formData);
      }
    }
  }

  public showCropper() {
    const dialogRef = this.cropperDialog.open(ToolIconCropperComponent, {
      width: '460px',
      data: { }
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        this.iconImage.nativeElement.src = result;
        this.imageUpdated = true;
      }
    });
  }

  public getCatList(text) {
    let offset = 0;
    let limit = 20;
    console.log(text)
    this.filteredOptions = this.service.getCategories(text).pipe();
    
    // this.filteredOptions = this.toolForm.get('categories').valueChanges.pipe(startWith(''), switchMap(value => this.service.getCategories(value)));
  }

  /*displayFn(item) {
    console.log(item);
    return item && item.name ? item.name : '';
  }*/

  onNoClick(): void {
    if (this.nodeResult) {
      this.dialogRef.close(this.nodeResult);
    } else {
      this.dialogRef.close();
    }
  }
}
