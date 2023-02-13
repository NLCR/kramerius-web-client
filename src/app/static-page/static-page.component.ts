import { forkJoin } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../services/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from '../services/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.scss']
})
export class StaticPageComponent implements OnInit {
  
  private dataSet: Map<string, string>;
  data = '';
  loading: boolean;
  page: string;
  termsAgreed: boolean;

  constructor(private http: HttpClient,
              private pageTitle: PageTitleService, 
              private translate: TranslateService, 
              private auth: AuthService,
              private appSettings: AppSettings, 
              private route: ActivatedRoute,
              private router: Router) {
    this.dataSet = new Map<string, string>();
  }
  ngOnInit() {
    this.loading = true;
    this.route.data.subscribe(data => {
      this.page = data['page'];
      const pageDef: [string, string] = this.appSettings[this.page + 'Page'];
      if (!pageDef) {
        this.router.navigate([this.appSettings.getRouteFor('')]);
      }
      this.pageTitle.setTitle(this.page, null);
      this.loading = true;
      this.translate.onLangChange.subscribe(() => {
        this.localeChanged();
      });
      const reqs = [];
      const dataArray = [];
      for(const [key, element] of Object.entries(pageDef)){
          reqs.push(this.http.get(element, { observe: 'response', responseType: 'text' })
          .pipe(map(response => response['body'])));
      }
      forkJoin(reqs)
      .subscribe( result => {
        for(const element in result) {
          dataArray.push(result[element]);
        }
        let keys = Object.keys(pageDef);
        for(let i = 0; i < dataArray.length; i++){
          this.dataSet.set(keys[i], dataArray[i]);
        }
        this.localeChanged();
        this.loading = false;
      },
      error => {
        this.loading = false;
      });
    });
  }

  private localeChanged() {
    if (this.dataSet.has(this.translate.currentLang)) {
      this.data = this.dataSet.get(this.translate.currentLang);
    } else {
      this.data = this.dataSet.get('en') || this.dataSet.get('cs')
    }
  }

  login() {
    if (this.termsAgreed) {
      this.auth.login();
    }
  }

}
