import { Component, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subject, startWith, takeUntil, tap } from 'rxjs';
import {
  FamilyTreeModel,
  createFamilyTreeControl,
  createFamilyTreeGroup,
  updateFamilyTreeFormGroup,
} from '../../family-tree.utils';

@Component({
  selector: 'forms-course-family-tree-form',
  templateUrl: './family-tree-form.component.html',
  styleUrls: ['./family-tree-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FamilyTreeFormComponent,
      multi: true,
    },
  ],
})
export class FamilyTreeFormComponent
  implements OnDestroy, ControlValueAccessor
{
  form: FormGroup;
  private _destroying$ = new Subject<void>();
  private _touched: any;

  get nameControl() {
    return this.form.get('name') as FormControl | undefined;
  }
  get ageControl() {
    return this.form.get('age') as FormControl | undefined;
  }
  get childrenControl() {
    return this.form.get('children') as FormArray | undefined;
  }

  writeValue(v: FamilyTreeModel) {
    if (this.form) {
      updateFamilyTreeFormGroup(this.form, v);
    } else {
      this.form = createFamilyTreeGroup(v);
    }
  }

  registerOnChange(fn) {
    this.form.valueChanges.pipe(
      takeUntil(this._destroying$),
      startWith(this.form.value),
      tap(fn)
    ).subscribe();
  }

  registerOnTouched(fn) {
    this._touched = fn;
  }

  addChild() {
    this.childrenControl.push(
      createFamilyTreeControl({ name: '', age: 0, children: [] })
    );
  }
  removeChildren(i: number) {
    this.childrenControl.removeAt(i);
  }
  ngOnDestroy() {
    this._destroying$.next();
  }
}
