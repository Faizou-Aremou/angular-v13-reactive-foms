import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import * as deepEqual from 'deep-equal';
import {
  HeroColumnFilters,
  HeroTableFormValue,
  defaultTableFormValue,
  Hero,
} from '../../+state/hero.utils';
import { Sort } from '@angular/material/sort';
import {
  Observable,
  combineLatest,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { HeroGridComponent } from '../../lesson1/hero-grid/hero-grid.component';
import { FormControl } from '@angular/forms';
import { HeroService } from '../../+state/hero.service';

@Component({
  selector: 'forms-course-server-side-table',
  templateUrl: './server-side-table.component.html',
  styleUrls: ['./server-side-table.component.css'],
})
export class ServerSideTableComponent implements OnInit {
  private _tableParams$: Observable<
    Sort & HeroColumnFilters & HeroTableFormValue
  >;
  @ViewChild(HeroGridComponent, { static: true })
  gridComponent: HeroGridComponent;
  tableForm = new FormControl(defaultTableFormValue);
  columnFilterForm = new FormControl({
    name: '',
    attack: '',
    defense: '',
    speed: '',
    health: '',
  });
  _heroInfo$: Observable<{ heroes: Hero[]; totalMatchingResults: number }>;
  heroes$: Observable<Hero[]>;
  totalItems$: Observable<number>;
  loading$: Observable<boolean> = this.api.loading$;

  constructor(private api: HeroService) {}

  ngOnInit() {
    setTimeout(() => {
      const heroesTotal$ = combineLatest([
        this.columnFilterForm.valueChanges.pipe(
          startWith(this.columnFilterForm.value)
        ),
        this.tableForm.valueChanges.pipe(startWith(this.tableForm.value)),
        this.gridComponent.sort.pipe(startWith(null)),
      ]).pipe(
        switchMap(([columnFilterForm, tableForm, sort]) =>
          this.api.heroes({
            ...columnFilterForm,
            ...tableForm,
            ...sort,
          })
        )
      );

      this.heroes$ = heroesTotal$
        .pipe(map((complet) => complet.heroes));
      this._heroInfo$ = heroesTotal$.pipe(
        map(({ heroes, matchingResults }) => ({
          heroes,
          totalMatchingResults: matchingResults,
        }))
      );
      this.totalItems$ = this._heroInfo$.pipe(map(({totalMatchingResults}) => totalMatchingResults));
      this.loading$ = this.api.loading$;
    }, 0);
  }
}
