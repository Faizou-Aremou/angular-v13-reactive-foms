import { Component, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subject, startWith, takeUntil } from 'rxjs';

interface Hero {
  name: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
  };
}

const stats = ['attack', 'defense', 'speed', 'health'];

@Component({
  selector: 'forms-course-hero-form',
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: HeroFormComponent, multi: true },
  ],
})
export class HeroFormComponent implements OnDestroy, ControlValueAccessor {
  private _destroying$ = new Subject<void>();
  stats = stats;
  formGroup: FormGroup;
  private _onChanged: any;
  private _onTouched: any;

  get statsFormGroup(){
    return this.formGroup.get('stats');
  }
  writeValue(hero: Hero) {
    if (!this.formGroup) {
      this.formGroup = new FormGroup({
        name: new FormControl(hero.name),
        stats: new FormGroup({
          attack: new FormControl(hero.stats.attack),
          defense: new FormControl(hero.stats.defense),
          speed: new FormControl(hero.stats.speed),
          health: new FormControl(hero.stats.health),
        }),
      });
    } else {
      this.formGroup.setValue(hero);
    }
  }

  registerOnChange(fn) {
    this._onChanged = fn;
    this.formGroup.valueChanges
      .pipe(takeUntil(this._destroying$), startWith(this.formGroup.value))
      .subscribe((formValue) => {
        this._onChanged(formValue);
      });
  }

  registerOnTouched(fn) {
    this._onTouched = fn;
  }

  blur() {
    this._onTouched();
  }

  setDisabledState(isDisabled: boolean) {
    isDisabled ? this.formGroup.disable() : this.formGroup.enable();
  }

  ngOnDestroy() {
    this._destroying$.next();
  }
}
