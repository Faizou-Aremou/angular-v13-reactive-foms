import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subject, startWith, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'forms-course-toggle-form',
  templateUrl: './toggle-form.component.html',
  styleUrls: ['./toggle-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ToggleFormComponent,
      multi: true,
    },
  ],
})
export class ToggleFormComponent implements OnDestroy, ControlValueAccessor {
  control: FormControl;
  @ViewChild('checkbox') checkbox: ElementRef<HTMLInputElement>;
  private _destroying = new Subject<void>();
  private _onTouched;
  private _onChanged;

  writeValue(v: boolean) {
    if (this.control) {
      this.control.setValue(v);
    } else {
      this.control = new FormControl(v);
    }
  }

  registerOnChange(fn) {
    this.control.valueChanges.pipe(
      startWith(this.control.value),
      takeUntil(this._destroying),
      tap((value)=> {
        fn(value);
      })
    ).subscribe()
  }

  registerOnTouched(fn) {
    this._onTouched = fn;
  }

  ngOnDestroy() {
    this._destroying.next();
  }
}
