import { Component, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { formatISO, formatISO9075 } from 'date-fns';
import { Subject, startWith, takeUntil } from 'rxjs';

const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const timeString = (date: Date) =>
  `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(
    date.getSeconds()
  )}`;
const dateString = (date: Date) =>
  `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(
    date.getDate()
  )}`;

@Component({
  selector: 'forms-course-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DateTimePickerComponent,
      multi: true,
    },
  ],
})
export class DateTimePickerComponent
  implements OnDestroy, ControlValueAccessor
{
  formGroup: FormGroup;
  private _destroying$ = new Subject<void>();
  private _onTouched;
  private _onChanged;
  isDisabled = false;

  writeValue(date: Date) {
    if (!this.formGroup) {
      this.formGroup = new FormGroup({
        date: new FormControl(formatISO(date, { representation: 'date' })),
        time: new FormControl(formatISO9075(date, { representation: 'time' })),
      });
    } else {
      this.formGroup.patchValue({
        date: formatISO(date, { representation: 'date' }),
        time: formatISO9075(date, { representation: 'time' }),
      });
      this._onChanged(date);
    }
  }

  registerOnChange(fn) {
    this._onChanged = fn;
    this.formGroup.valueChanges
      .pipe(takeUntil(this._destroying$), startWith(this.formGroup.value))
      .subscribe(({date, time}) => {
        this._onChanged(date && time ? new Date(`${date} ${time}`) : null);
      });
  }

  registerOnTouched(fn) {
    this._onTouched = fn;
  }

  blur() {
    this._onTouched();
  }

  setDisabledState(isDisabled: boolean) {
    isDisabled ? this.formGroup.disable(): this.formGroup.enable()
  }

  ngOnDestroy() {
    this._destroying$.next();
  }
}
