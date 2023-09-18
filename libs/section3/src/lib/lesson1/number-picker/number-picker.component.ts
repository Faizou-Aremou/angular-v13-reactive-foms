import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'forms-course-number-picker',
  templateUrl: './number-picker.component.html',
  styleUrls: ['./number-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NumberPickerComponent,
      multi: true
    }
  ]
})
export class NumberPickerComponent implements ControlValueAccessor {
  value: number;
  private _onChange;
  private _onTouched;


  subtractOne() {
    this.value -= 1;
    this._onChange(this.value);
  }

  addOne() {
    this.value += 1;
    this._onChange(this.value);
  }

  writeValue(value: number) {
    this.value = value;
  }

  registerOnChange(fn) {
    this._onChange = fn;
  }

  registerOnTouched(fn) {
   this._onTouched = fn
  }

  blur() {
    this._onTouched()
  }

}
