import { Component, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
} from '@angular/forms';
import { Subject, startWith, takeUntil, tap } from 'rxjs';
import {
  DateRange,
  createDateRangePickerFormGroup,
} from '../../date-range-picker-utils';

@Component({
  selector: 'forms-course-date-range-picker-form',
  templateUrl: './date-range-picker-form.component.html',
  styleUrls: ['./date-range-picker-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DateRangePickerFormComponent,
      multi: true,
    },
  ],
})
export class DateRangePickerFormComponent
  implements OnDestroy, ControlValueAccessor
{
  form: FormGroup;
  private _destroying$ = new Subject<void>();
  private _touched: any;

  writeValue(dateRange: DateRange) {
    if (!this.form) {
      this.form = createDateRangePickerFormGroup(dateRange);
    }
    this.form.setValue(dateRange);
  }

  registerOnChange(fn) {
    this.form.valueChanges
      .pipe(takeUntil(this._destroying$), startWith(this.form.value), tap(fn))
      .subscribe();
  }

  registerOnTouched(fn) {
    this._touched(fn);
  }

  setDisabledState(isDisabled: boolean) {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  ngOnDestroy() {
    this._destroying$.next();
  }
}
