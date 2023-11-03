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
import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

const createPaginationOptions = (
  currentPage: number,
  totalPages: number
): number[] => {
  const temp: number[] = [currentPage];
  let negativePointer = currentPage - 1;
  let positivePointer = currentPage + 1;
  while (
    temp.length < 5 &&
    (negativePointer > 0 || positivePointer <= totalPages)
  ) {
    if (negativePointer > 0) {
      temp.unshift(negativePointer);
    }
    if (positivePointer <= totalPages) {
      temp.push(positivePointer);
    }
    negativePointer--;
    positivePointer++;
  }
  return temp;
};

@Component({
  selector: 'forms-course-pagination-form',
  templateUrl: './pagination-form.component.html',
  styleUrls: ['./pagination-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PaginationFormComponent,
      multi: true,
    },
  ],
})
/**
 * Pagination is form Component
 */
export class PaginationFormComponent
  implements ControlValueAccessor, OnDestroy, OnChanges
{
  @Input() totalPages = 1;
  private _totalPages$ = new ReplaySubject<number>(1);
  control: FormControl;
  private _destroying = new Subject<void>();
  public paginationOptions$: Observable<number[]>;
  public showFirst$: Observable<boolean>;
  public showFirstElipsis$: Observable<boolean>;
  public showLastElipsis$: Observable<boolean>;
  public showLast$: Observable<boolean>;

  writeValue(v: number) {
    // create your own implementation here
    // make sure to create all required Observables here!
    if (!this.control) {
      this.control = new FormControl(v);
      this.paginationOptions$ = combineLatest([
        this.control.valueChanges.pipe(startWith(this.control.value)),
        this._totalPages$,
      ]).pipe(
        map(([currentPage, totalPages]) =>
          createPaginationOptions(currentPage, totalPages)
        )
      );
      this._setFirstAndLastObservables();
    } else {
      this.control.setValue(v);
    }
  }

  private _setFirstAndLastObservables() {
    this.showFirst$ = this.paginationOptions$.pipe(
      map((options) => options.length > 1 && !options.includes(1))
    );
    this.showFirstElipsis$ = this.paginationOptions$.pipe(
      map((options) => options.length > 2 && !options.includes(2))
    );
    this.showLast$ = combineLatest([
      this.paginationOptions$,
      this._totalPages$,
    ]).pipe(
      map(
        ([options, totalPages]) =>
          options.length > 1 && !options.includes(totalPages)
      )
    );
    this.showLastElipsis$ = combineLatest([
      this.paginationOptions$,
      this._totalPages$,
    ]).pipe(
      map(
        ([options, totalPages]) =>
          options.length > 2 && !options.includes(totalPages - 1)
      )
    );
  }

  registerOnChange(fn) {
    this.control.valueChanges
      .pipe(startWith(this.control.value), takeUntil(this._destroying), tap(fn))
      .subscribe();
  }

  registerOnTouched(fn) {}

  userClick(pageNumber: number) {
    this.control.setValue(pageNumber);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalPages) {
      this._totalPages$.next(this.totalPages);
    }
  }

  ngOnDestroy() {
    this._destroying.next();
  }
}
