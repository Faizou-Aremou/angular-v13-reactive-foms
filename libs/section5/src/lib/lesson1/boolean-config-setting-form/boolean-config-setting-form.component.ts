import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Observable, ReplaySubject, Subject, combineLatest, of } from 'rxjs';
import { createBooleanConfigSettingControl } from '../../config-settings.utils';
import { startWith, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'forms-course-boolean-config-setting-form',
  templateUrl: './boolean-config-setting-form.component.html',
  styleUrls: ['./boolean-config-setting-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: BooleanConfigSettingFormComponent,
      multi: true,
    },
  ],
})
export class BooleanConfigSettingFormComponent
  implements ControlValueAccessor, OnDestroy, OnChanges
{
  @Input() name: string;
  @Input() storeValue: boolean;
  private _storeValue$ = new ReplaySubject<boolean>(1);
  control: FormControl;
  formValueMatchesStoreValue$: Observable<boolean>;
  _destroying$ = new Subject<void>();
  private _onTouched;

  writeValue(v: boolean) {
    // add your implementation here!
    // make sure to use and know what's going on in config-settings.utils.ts!!
    // also make sure to create the formValueMatchesStoreValue in this method!
    if (this.control) {
      this.control.setValue(v);
    } else {
      this.control = createBooleanConfigSettingControl(v);
    }
    this.formValueMatchesStoreValue$ = combineLatest([
      this.control.valueChanges.pipe(startWith(this.control.value)),
      this._storeValue$,
    ]).pipe(map(([value, storedValue]) => value === storedValue));
  }

  private isEqualToStoreValue(v: boolean): boolean {
    return v === this.storeValue;
  }

  registerOnChange(fn) {
    // add your implementation here!
    this.control.valueChanges
      .pipe(
        takeUntil(this._destroying$),
        startWith(this.control.value),
        tap(fn)
      )
      .subscribe();
  }

  registerOnTouched(fn) {
    this._onTouched = fn;
  }

  blur() {
    this._onTouched();
  }

  setDisabledState(isDisabled: boolean) {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.storeValue) {
      this._storeValue$.next(this.storeValue);
    }
  }

  ngOnDestroy() {
    this._destroying$.next();
  }
}
