import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-display-metadata-dialog',
  templateUrl: './display-metadata-dialog.component.html',
  styleUrls: ['./display-metadata-dialog.component.scss']
})
export class DisplayMetadataDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DisplayMetadataDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }
  onClose() {
    this.dialogRef.close();
  }

}

