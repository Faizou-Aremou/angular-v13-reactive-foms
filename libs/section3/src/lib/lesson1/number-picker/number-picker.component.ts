import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'forms-course-number-picker',
  templateUrl: './number-picker.component.html',
  styleUrls: ['./number-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NumberPickerComponent,
      multi: true,
    },
  ],
})
export class NumberPickerComponent implements ControlValueAccessor {
  value: number;
  private _onChange;
  private _onTouched;
  constructor(private cd: ChangeDetectorRef) {}
  @ViewChild('subtract') subtract;
  @ViewChild('display') display;
  @ViewChild('add') add;

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
    this._onTouched = fn;
  }

  blur() {
    setTimeout(() => {
      console.log(document.activeElement);
      if (
        document.activeElement !== this.subtract._elementRef.nativeElement &&
        document.activeElement !== this.add._elementRef.nativeElement &&
        document.activeElement !== this.display.nativeElement
      ) {
        console.log('focusout() called!!');
        this._onTouched();
      }
    }, 0);
  }
}
