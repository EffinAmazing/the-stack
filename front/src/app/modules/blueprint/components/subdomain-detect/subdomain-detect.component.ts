import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-subdomain-detect',
  templateUrl: './subdomain-detect.component.html',
  styleUrls: ['./subdomain-detect.component.scss']
})
export class SubdomainDetectComponent implements OnInit {
  @Input() domain: string;
  hasSubdomain = false;
  subdomain = '';
  withoutSubdomain = '';

  constructor(private router: Router) {

  }

  ngOnInit(): void {
    this.detectSubdomain();
  }

  detectSubdomain() {
    console.log(this.domain);
    if (/^([a-z\-]+\.)+[([a-z\-]+(\.[a-z]{3}\.?[a-z]{2}|\.[a-z]{3})$/igm.test(this.domain)) {
        const match = /^([a-z\-]+\.)+[([a-z\-]+(\.[a-z]{3}\.?[a-z]{2}|\.[a-z]{3})$/igm.exec(this.domain);
        this.hasSubdomain = true;
        this.subdomain = match[1];
        this.withoutSubdomain = this.domain.replace(this.subdomain, '');
     }
  }

  redirectToDomain(domain) {
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigateByUrl('/stack/build?domain=' + domain, { skipLocationChange: false });
    window.location.href = window.location.origin + window.location.pathname + '#/stack/build?domain=' + domain;
    window.location.reload();
  }

}
