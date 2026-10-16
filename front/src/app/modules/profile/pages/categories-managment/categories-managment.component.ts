import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { BlockRuleDialogComponent } from '../../components/block-rule-dialog/block-rule-dialog.component';

type RuleKind = 'categories' | 'tags';
type RuleStatus = 'whitelisted' | 'normal' | 'blocked';

interface RuleRow {
  name: string;
  tools: number;
  examples: string[];
  status: RuleStatus;
  isNew: boolean;
}

const searchDelay = 400;

@Component({
  selector: 'app-categories-managment',
  templateUrl: './categories-managment.component.html',
  styleUrls: ['./categories-managment.component.scss']
})
export class CategoriesManagmentComponent implements OnInit, OnDestroy {
  user: any;
  kind: RuleKind = 'categories';
  filter = 'all';
  search = '';
  rows: RuleRow[] = [];
  noCategory: RuleRow = null;
  counts: { [key: string]: number } = {};
  tabTotals = { categories: 0, tags: 0 };
  total = 0;
  limit = 25;
  offset = 0;
  displayedColumns = ['name', 'tools', 'examples', 'status'];
  saving: { [name: string]: boolean } = {};
  errorMessage = '';
  private search$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private service: BlueprintsService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.user = this.auth.getCurrentUser();
  }

  get filters(): string[] {
    return this.kind === 'categories' ? ['all', 'new', 'whitelisted', 'blocked', 'normal'] : ['all', 'new', 'blocked', 'normal'];
  }

  get statuses(): RuleStatus[] {
    return this.kind === 'categories' ? ['whitelisted', 'normal', 'blocked'] : ['normal', 'blocked'];
  }

  ngOnInit(): void {
    this.subscriptions.push(this.search$.pipe(debounceTime(searchDelay)).subscribe(() => this.load(0)));
    this.kind = this.route.snapshot.queryParamMap.get('tab') === 'tags' ? 'tags' : 'categories';
    this.loadTabTotal(this.kind === 'categories' ? 'tags' : 'categories');
    this.load(0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setKind(kind: RuleKind) {
    if (kind === this.kind) { return; }
    this.kind = kind;
    this.filter = 'all';
    this.search = '';
    this.load(0);
  }

  setFilter(filter: string) {
    this.filter = filter;
    this.load(0);
  }

  handleSearch() {
    this.search$.next();
  }

  handlePage(evnt) {
    this.load(evnt.pageIndex * this.limit);
  }

  load(offset: number) {
    this.offset = offset;
    this.errorMessage = '';
    const params = { search: this.search.trim(), status: this.filter, offset, limit: this.limit };
    const request = this.kind === 'categories' ? this.service.getAdminCategories(params) : this.service.getAdminTags(params);
    request.toPromise().then((res) => {
      this.rows = res.list;
      this.total = res.total;
      this.counts = res.counts;
      this.noCategory = this.kind === 'categories' && this.filter === 'all' && !this.search.trim() ? res.noCategory : null;
      if (!this.search.trim()) { this.tabTotals[this.kind] = res.counts.all; }
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not load ' + this.kind + '.';
    });
  }

  statusLabel(status: RuleStatus): string {
    return status === 'whitelisted' ? 'Whitelist' : (status === 'blocked' ? 'Block' : 'Normal');
  }

  toolsLink(row: RuleRow) {
    return this.kind === 'categories' ? { category: row.name } : { tag: row.name };
  }

  changeStatus(row: RuleRow, status: RuleStatus) {
    if (status === row.status) { return; }
    if (status !== 'blocked') {
      this.save(row, status);
      return;
    }
    const kind = this.kind === 'categories' ? 'category' : 'tag';
    this.service.getBlockImpact(kind, row.name).toPromise().then((impact) => {
      this.dialog.open(BlockRuleDialogComponent, {
        width: '560px',
        data: { kind, name: row.name, tools: impact.tools, alsoWhitelisted: impact.alsoWhitelisted }
      }).afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.save(row, status);
        } else {
          this.resetRow(row);
        }
      });
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not check the impact of blocking ' + row.name + '.';
      this.resetRow(row);
    });
  }

  private save(row: RuleRow, status: RuleStatus) {
    const value = status === 'normal' ? null : status;
    this.saving[row.name] = true;
    const request = this.kind === 'categories'
      ? this.service.setCategoryStatus(row.name, value as any)
      : this.service.setTagStatus(row.name, value as any);
    request.toPromise().then(() => {
      this.saving[row.name] = false;
      this.load(this.offset); // stay on the same page
    }).catch((err) => {
      console.log(err);
      this.saving[row.name] = false;
      this.errorMessage = 'Could not save ' + row.name + '. Nothing was changed.';
      this.resetRow(row);
    });
  }

  // Re-create the row object so the toggle group snaps back to the saved status.
  private resetRow(row: RuleRow) {
    if (this.noCategory && row === this.noCategory) {
      this.noCategory = Object.assign({}, row);
    } else {
      this.rows = this.rows.map(r => r === row ? Object.assign({}, row) : r);
    }
  }

  private loadTabTotal(kind: RuleKind) {
    const request = kind === 'categories'
      ? this.service.getAdminCategories({ status: 'all', offset: 0 })
      : this.service.getAdminTags({ status: 'all', offset: 0 });
    request.toPromise().then((res) => { this.tabTotals[kind] = res.counts.all; }).catch(err => console.log(err));
  }
}
