import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { heroSelector } from '../../+state/hero.selector';
@Injectable({
  providedIn: 'root',
})
export class NameAlreadyAdded implements AsyncValidator {
  constructor(private store: Store<any>) {}
  validate(
    control: AbstractControl
  ): Promise<ValidationErrors> | Observable<ValidationErrors> {
    const heroes$ = this.store.select(heroSelector);
    return heroes$.pipe(
      take(1),
      map((heroes: string[]) => {
        const exist = heroes.some((hero) => control.value === hero);
        console.log(exist)
        return exist ? { nameExist: control.value } : null;
      })
    );
  }
}
