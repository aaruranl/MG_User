import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ROUTER_MODULES } from '../../common/common-imports';

@Component({
  selector: 'app-page-not-found',
  imports: [CommonModule, ROUTER_MODULES],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {}
