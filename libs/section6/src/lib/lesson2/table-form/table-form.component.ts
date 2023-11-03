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
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  map,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { HeroTableFormValue } from '../../+state/hero.utils';

@Component({
  selector: 'forms-course-table-form',
  templateUrl: './table-form.component.html',
  styleUrls: ['./table-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TableFormComponent,
      multi: true,
    },
  ],
})
export class TableFormComponent
  implements ControlValueAccessor, OnDestroy, OnChanges
{
  @Input() totalItems: number;
  private _totalItems = new ReplaySubject<number>(1);
  form: FormGroup;
  private _destroying = new Subject<void>();
  totalPages$: Observable<number>;

  writeValue(v: HeroTableFormValue) {
    // create your implementation here
    if (!this.form) {
      this.form = new FormGroup(
        Object.keys(v).reduce((form, key: string) => {
          return { ...form, ...{ [key]: new FormControl(v[key]) } };
        }, {})
      );
    } else {
      this.form.setValue(v);
    }
    this.totalPages$ = combineLatest([
      this._totalItems,
      this.form.valueChanges.pipe(startWith(this.form.value)),
    ]).pipe(map(([total, formValue]) => total / formValue.pageSize));
  }

  registerOnChange(fn) {
    // create your implementation here
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      takeUntil(this._destroying),
      tap(fn)
    ).subscribe();
  }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean) {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalItems) {
      this._totalItems.next(this.totalItems);
    }
  }

  ngOnDestroy() {
    this._destroying.next();
  }
}
