import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HeroGridComponent } from '../../lesson1/hero-grid/hero-grid.component';
import { FormControl } from '@angular/forms';
import {
  defaultTableFormValue,
  Hero,
  sortHeroes,
  heroGlobalFilter,
  heroColumnFilter,
  heroesOnPage,
} from '../../+state/hero.utils';
import { Sort } from '@angular/material/sort';
import { Observable, combineLatest } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {
  startWith,
  map,
  switchMap,
  shareReplay,
  share,
  debounceTime,
} from 'rxjs/operators';
import { heroSelector } from '../../+state/hero.selector';

@Component({
  selector: 'forms-course-client-side-table',
  templateUrl: './client-side-table.component.html',
  styleUrls: ['./client-side-table.component.css'],
})
export class ClientSideTableComponent implements AfterViewInit {
  @ViewChild(HeroGridComponent, { static: true })
  heroGridComponent: HeroGridComponent;
  tableForm = new FormControl(defaultTableFormValue);
  columnFilterForm = new FormControl({
    name: '',
    attack: '',
    defense: '',
    speed: '',
    health: '',
  });
  sortInstructions$: Observable<Sort>;
  allHeroes: Observable<Hero[]>;
  filteredHeroes: Observable<Hero[]>;
  totalItems$: Observable<number>;
  heroesOnPage$: Observable<Hero[]>;

  constructor(private store: Store<any>) {}

  ngAfterViewInit() {
    this.sortInstructions$ = this.heroGridComponent.sort.pipe(
      startWith(null)
    );
    this.allHeroes = this.store.pipe(select(heroSelector));
    this.totalItems$ = this.allHeroes.pipe(map((heroes) => heroes.length));
    this.filteredHeroes = combineLatest([
      this.columnFilterForm.valueChanges.pipe(
        startWith(this.columnFilterForm.value)
      ),
      this.tableForm.valueChanges.pipe(startWith(this.tableForm.value)),
      this.allHeroes,
      this.sortInstructions$,
    ]).pipe(
      map(([columnFilter, tableForm, allHeroes, sortInstructions]) =>
        sortHeroes(
          allHeroes.filter(
            (hero) =>
              heroGlobalFilter(hero, tableForm.filter) &&
              heroColumnFilter(hero, columnFilter)
          ),
          sortInstructions
        )
      )
    );
    this.heroesOnPage$ = combineLatest([
      this.allHeroes,
      this.tableForm.valueChanges.pipe(startWith(this.tableForm.value)),
    ]).pipe(map(([heroes, tableForm]) => heroesOnPage(heroes, tableForm)));
  }
}
