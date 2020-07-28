import { Injectable } from '@angular/core';
import { HistoryAction } from '../../shared/models/hisotry';
import { Observable, BehaviorSubject } from 'rxjs';

const maxSavedAction = 5;

@Injectable({
  providedIn: 'root'
})
export class ActionHistoryService {
  private historyList: { [key: string]: HistoryAction[] } = {};
  private revertedList: { [key: string]: HistoryAction[] } = {};
  public emiters: { [key: string]: BehaviorSubject<{ action: HistoryAction, undo: boolean } | null> }  = {};

  constructor() {
    window['dataLayer'] = window['dataLayer'] || [];
  }

  public getEmmiter(id: string): BehaviorSubject<{ action: HistoryAction, undo: boolean } | null> {
    if (!this.emiters[id]) {
      this.emiters[id] = new BehaviorSubject(null);
    }
    return this.emiters[id];
  }

  public isActivePrev(id: string): boolean {
    if (!!this.historyList[id] && this.historyList[id].length !== 0) {
      return false;
    } else {
      return true;
    }
  }

  public isActiveNext(id: string): boolean {
    if (this.revertedList[id] && this.revertedList[id].length !== 0) {
      return false;
    } else {
      return true;
    }
  }

  addAction(id: string, data: HistoryAction) {
    console.log(' addAction - ', data);
    if (!this.emiters[id]) {
      this.emiters[id] = new BehaviorSubject(null);
    }

    if (!this.historyList[id]) {
      this.historyList[id] = [];
    } else {
      if (this.historyList[id].length >= maxSavedAction) {
        this.historyList[id].shift();
      }
    }
    this.revertedList[id] = [];
    this.historyList[id].push(data);

    console.log(this.historyList);
  }

  prevAction(id: string): void {
    if (this.historyList[id] && this.emiters[id]) {
      const action = this.historyList[id].pop();
      this.revertedList[id].push(action);

      window['dataLayer'].push({
        event: 'stackbuilder.undo',
        action: action.name,
      });

      this.emiters[id].next({ action, undo: true });
    }
  }

  nextAction(id: string): void {
    if (this.revertedList[id] && this.revertedList[id].length) {
      const action = this.revertedList[id].pop();
      this.historyList[id].push(action);
      window['dataLayer'].push({
        event: 'stackbuilder.redo',
        action: action.name,
      });
      this.emiters[id].next({ action, undo: false });
    }
  }
}
