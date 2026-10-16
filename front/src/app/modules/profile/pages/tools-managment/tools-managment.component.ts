import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from '../../../../core/services/auth.service';
import { ToolsService } from '../../../../core/services/tools.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';

const host = environment.serverURI;
const searchDelay = 500;

type AdminSetting = 'default' | 'show' | 'hide';

interface RuleLists { whitelisted: string[]; blocked: string[]; blockedTags: string[]; }

interface ToolRow {
  tool: any;
  setting: AdminSetting;
  result: { kind: 'shown' | 'hidden' | 'auto', label: string, detail: string };
}

@Component({
  selector: 'app-tools-managment',
  templateUrl: './tools-managment.component.html',
  styleUrls: ['./tools-managment.component.scss']
})
export class ToolsManagmentComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  user: any;
  rows: ToolRow[] = [];
  limit = 10;
  total = 0;
  offset = 0;
  displayedColumns: string[] = ['select', 'name', 'logo', 'categories', 'setting', 'result'];
  toolSearchName = '';
  categoryFilter = '';
  tagFilter = '';
  settingFilter: '' | AdminSetting = '';
  rules: RuleLists = { whitelisted: [], blocked: [], blockedTags: [] };
  selection = new SelectionModel<string>(true, []);
  saving = false;
  errorMessage = '';
  private search$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private toolsService: ToolsService,
    private blueprintService: BlueprintsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.search$.pipe(debounceTime(searchDelay)).subscribe(() => this.load(0)));
    this.subscriptions.push(this.route.queryParamMap.subscribe((params) => {
      this.categoryFilter = params.get('category') || '';
      this.tagFilter = params.get('tag') || '';
      this.load(0);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  load(offset: number) {
    this.offset = offset;
    this.selection.clear();
    if (offset === 0 && this.paginator) { this.paginator.firstPage(); }
    this.toolsService.queryTools({
      name: this.toolSearchName.trim(),
      category: this.categoryFilter,
      tag: this.tagFilter,
      setting: this.settingFilter,
      offset
    }).toPromise().then((res) => {
      this.rules = res.rules || this.rules;
      this.total = res.total;
      this.rows = res.list.map(tool => this.toRow(tool));
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not load tools.';
    });
  }

  handlePage(evnt) {
    this.load(evnt.pageIndex * this.limit);
  }

  handleInputText() {
    this.search$.next();
  }

  setSettingFilter(value: '' | AdminSetting) {
    this.settingFilter = value;
    this.load(0);
  }

  clearFilter(key: 'category' | 'tag') {
    const queryParams = {};
    queryParams[key] = null;
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  categoryStatus(name: string): 'whitelisted' | 'blocked' | 'normal' {
    if (this.rules.whitelisted.indexOf(name) !== -1) { return 'whitelisted'; }
    if (this.rules.blocked.indexOf(name) !== -1) { return 'blocked'; }
    return 'normal';
  }

  tagBlocked(name: string): boolean {
    return this.rules.blockedTags.indexOf(name) !== -1;
  }

  isAllSelected(): boolean {
    return this.rows.length > 0 && this.rows.every(row => this.selection.isSelected(row.tool.id));
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.rows.forEach(row => this.selection.select(row.tool.id));
    }
  }

  setVisibility(ids: string[], state: AdminSetting) {
    if (!ids.length || this.saving) { return; }
    this.saving = true;
    this.errorMessage = '';
    this.blueprintService.bulkSetToolVisibility(ids, state).toPromise().then((res) => {
      const updated = {};
      res.tools.forEach(tool => { updated[tool.id] = tool; });
      this.rows = this.rows.map(row => updated[row.tool.id]
        ? this.toRow(Object.assign({}, row.tool, { hidden: updated[row.tool.id].hidden, result: updated[row.tool.id].result }))
        : row);
      this.selection.clear();
      this.saving = false;
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not save. Nothing was changed.';
      this.rows = this.rows.map(row => this.toRow(row.tool)); // reset toggles
      this.saving = false;
    });
  }

  setSelected(state: AdminSetting) {
    this.setVisibility(this.selection.selected, state);
  }

  processImageSrc(link) {
    if (!link) { return ''; }
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1) {
      return link;
    }
    return host + link;
  }

  // tool.hidden: true = Hide, false = Show, null/absent = Default.
  private toRow(tool: any): ToolRow {
    const setting: AdminSetting = tool.hidden === true ? 'hide' : (tool.hidden === false ? 'show' : 'default');
    return { tool, setting, result: this.describe(tool.result || { state: null, reason: 'auto' }) };
  }

  // Formats the server's decideTool result for the "Result on new stacks" column.
  private describe(decision: { state: string, reason: string, detail?: string }): ToolRow['result'] {
    switch (decision.reason) {
      case 'admin-show': return { kind: 'shown', label: 'Shown', detail: 'Admin exception' };
      case 'admin-hide': return { kind: 'hidden', label: 'Hidden', detail: 'Hidden by admin' };
      case 'whitelisted': return { kind: 'shown', label: 'Shown', detail: 'Whitelisted: ' + decision.detail };
      case 'blocked-category': return { kind: 'hidden', label: 'Hidden', detail: 'Blocked category: ' + decision.detail };
      case 'blocked-tag': return { kind: 'hidden', label: 'Hidden', detail: 'Blocked tag: ' + decision.detail };
      default: return { kind: 'auto', label: 'Auto', detail: 'Standard stack rules' };
    }
  }
}
