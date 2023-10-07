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
import { createNumberConfigSettingControl } from '../../config-settings.utils';
import { startWith, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'forms-course-number-config-setting-form',
  templateUrl: './number-config-setting-form.component.html',
  styleUrls: ['./number-config-setting-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NumberConfigSettingFormComponent,
      multi: true,
    },
  ],
})
export class NumberConfigSettingFormComponent
  implements OnDestroy, ControlValueAccessor
{
  @Input() name: string;
  @Input() set storeValue(value: number | undefined) {
    if (value !== undefined) {
      console.log(value);
      this._storeValue$.next(value);
    }
  }
  private _storeValue$ = new ReplaySubject<number>(1);
  formValueMatchesStoreValue$: Observable<boolean>;
  control: FormControl;
  _destroying$ = new Subject<void>();
  _onTouched;

  writeValue(v: number) {
    // add your implementation here!
    if (!this.control) {
      this.control = createNumberConfigSettingControl(v);
    } else {
      this.control.setValue(v);
    }

    this.formValueMatchesStoreValue$ = combineLatest([
      this.control.valueChanges.pipe(startWith(this.control.value)),
      this._storeValue$,
    ]).pipe(
      tap(([value, storeValue]) => console.log('emit',storeValue)),
      map(([value, storeValue]) => value === storeValue)
    );
  }

  registerOnChange(fn) {
    this.control.valueChanges
      .pipe(takeUntil(this._destroying$), startWith(this.control.value))
      .subscribe(fn);
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

  ngOnDestroy() {
    this._destroying$.next();
  }
}
