import { Component, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subject, startWith, takeUntil, tap } from 'rxjs';
import { Party, createPartyFormGroup } from '../../hero-party-utils';

@Component({
  selector: 'forms-course-hero-party-form',
  templateUrl: './hero-party-form.component.html',
  styleUrls: ['./hero-party-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: HeroPartyFormComponent,
      multi: true,
    },
  ],
})
export class HeroPartyFormComponent implements OnDestroy, ControlValueAccessor {
  private _destroying$ = new Subject<void>();
  form: FormGroup;
  validPartySizes = [1, 2, 3, 4, 5, 6];
  private _changed;
  private _touched;
  constructor() {}
  get nameControl() {
    return this.form.get('name');
  }
  get sizeControl() {
    return this.form.get('size');
  }
  get heroesControls() {
    return this.form.get('heroes') as FormArray;
  }

  writeValue(party: Party) {
    if (!this.form) {
      this.form = createPartyFormGroup(party, this._destroying$);
    }
    {
      this.form.patchValue(party);
    }
  }

  registerOnChange(fn) {
    this.form.valueChanges
      .pipe(startWith(this.form.value), takeUntil(this._destroying$), tap(fn))
      .subscribe();
  }

  registerOnTouched(fn) {
    this._touched = fn;
  }

  setDisabledState(disable: boolean) {
    disable ? this.form.disable() : this.form.enable();
  }

  ngOnDestroy() {
    this._destroying$.next();
  }
}
