import { AppSettings } from './../../services/app-settings';
import { DocumentItem } from './../../model/document_item.model';
import { KrameriusApiService } from './../../services/kramerius-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { LicenceService } from '../../services/licence.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss']
})
export class DocumentCardComponent implements OnInit {
  @Input() item: DocumentItem;
  @Input() in: String;
  @Input() selectable: boolean = false;
  
  thumb;
  lock: any;
  legacyLocks: boolean;

  constructor(private krameriusApiService: KrameriusApiService,
              private settings: AppSettings,
              private translate: TranslateService,
              public auth: AuthService,
              private licences: LicenceService,
              public analytics: AnalyticsService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.init();
    console.log('this.item', this.item);
  }

  getTitle() {
    return this.item.getTitle ? this.item.getTitle(this.translate.currentLang) : this.item.title;
  }

  getDescription() {
    return this.item.getDescription ? this.item.getDescription(this.translate.currentLang) : this.item.description;
  }

  libraryLogo(): string {
    return this.settings.getLogoByCode(this.item.library);
  }

  sourceLogo(source: string): string {
    return `https://registr.digitalniknihovna.cz/libraries/${source}/logo`;
  }

  private init() {
    let url = '';
    if (this.item.library) {
      const krameriusUrl = this.settings.getUrlByCode(this.item.library);
      url = this.krameriusApiService.getThumbUrlForKramerius(this.item.uuid, krameriusUrl);
    } else {
       url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    }
    this.lock = this.licences.buildLock(this.item.licences, this.item.public);
    this.legacyLocks = this.settings.legacyLocks;
    this.thumb = this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }


}
