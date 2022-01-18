
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Translator } from 'angular-translator';
import { CitationService } from '../../services/citation.service';
import { ShareService } from '../../services/share.service';
import { SolrService } from '../../services/solr.service';

@Component({
  templateUrl: './citation-dialog.component.html',
  styleUrls: ['./citation-dialog.component.scss']
})
export class CitationDialogComponent implements OnInit {

  items = [];
  selection;

  constructor(
    public dialogRef: MatDialogRef<CitationDialogComponent>,
    private citationService: CitationService, 
    private shareService: ShareService, 
    private translator: Translator,
    @Inject(MAT_DIALOG_DATA) private data: any) { }


    ngOnInit(): void {
      this.items = this.data.metadata.getFullContext(SolrService.allDoctypes);
      if (this.items.length > 0) {
        this.changeTab(this.items[0]);
      }
    }
  
    changeTab(item) {
      this.selection = item;
      if (!this.selection.citation) {
        this.citationService.getCitation(item.uuid).subscribe( (citation: string) => {
          const link = this.shareService.getPersistentLink(item.uuid);
          const locText = this.translator.instant("share.available_from");
          item.citation = `${citation} ${locText}: ${link}`;
        });
      }
    }

  onCancel() {
    this.dialogRef.close();
  }

}