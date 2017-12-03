import { BrowseService } from './../../services/browse.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-browse-filters',
  templateUrl: './browse-filters.component.html',
  styleUrls: ['./browse-filters.component.scss']
})
export class BrowseFiltersComponent implements OnInit {

  constructor(public browseService: BrowseService) {
  }

  ngOnInit() {
  }

}
