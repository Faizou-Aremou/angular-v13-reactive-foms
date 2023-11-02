import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ConfigSettings,
  configSettingsSelector,
  savePendingSelector,
  submitSaveRequest,
} from '../+state';
import { Observable, Subject, combineLatest, lastValueFrom, of } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import {
  takeUntil,
  tap,
  startWith,
  map,
  shareReplay,
  take,
  switchMap,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import { createConfigSettingFormControl } from '../wizard-form.utils';
import * as deepEqual from 'deep-equal';
import { CompletedDiscardChangesDialogComponent } from '../completed/completed-discard-changes-dialog/completed-discard-changes-dialog.component';
import { CompletedConfimationDialogComponent } from '../completed/completed-confimation-dialog/completed-confimation-dialog.component';
import { flatten } from 'ramda';

@Component({
  selector: 'forms-course-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
})
export class WizardComponent implements OnDestroy {
  control: FormControl;
  configSettingsFromStore$: Observable<ConfigSettings> = this.store.pipe(
    select(configSettingsSelector)
  );
  private _formHasChanges$: Observable<boolean>;
  private _formIsValid$: Observable<boolean>;
  private _destroying$ = new Subject<void>();
  submitButtonDisabled$: Observable<boolean>;
  discardChangesButtonDisabled$: Observable<boolean>;
  savePending$: Observable<boolean> = this.store.pipe(
    select(savePendingSelector)
  );

  constructor(private store: Store<any>, private dialog: MatDialog) {
    this.configSettingsFromStore$
      .pipe(
        takeUntil(this._destroying$),
        tap((configSettings) => {
          // create your form here in lesson 3
          if (!this.control) {
            this.control = createConfigSettingFormControl(configSettings);
            this._formIsValid$ = this.control.statusChanges.pipe(
              startWith(this.control.status),
              map((status) => status === 'VALID')
            );
          } else {
            this.control.setValue(configSettings);
          }
        })
      )
      .subscribe();
    this._formHasChanges$ = combineLatest([
      this.control.valueChanges.pipe(startWith(this.control.value)),
      this.configSettingsFromStore$,
    ]).pipe(
      map(
        ([formValue, storeConfigSettingValue]) =>
          !deepEqual(formValue, storeConfigSettingValue)
      ),
      publishReplay(1),
      refCount()
    ); // implement your change detection here!!! (in lesson 3)
    this.submitButtonDisabled$ = combineLatest([
      this._formIsValid$,
      this._formHasChanges$,
      this.savePending$,
    ]).pipe(
      map(
        ([formIsValid, formHasChanges, savePending]) =>
          !formIsValid || !formHasChanges || savePending
      )
    );
    this.discardChangesButtonDisabled$ = this._formHasChanges$.pipe(
      map((hasChanges) => !hasChanges)
    );
    this.savePending$
      .pipe(
        takeUntil(this._destroying$),
        tap((savePending) =>
          savePending ? this.control.disable() : this.control.enable()
        )
      )
      .subscribe();
  }

  async confirmSave(): Promise<void> {
    // add your implementation here in lesson 5
    const hasChanged = await lastValueFrom(this._formHasChanges$.pipe(take(1)));
    if (!hasChanged) {
      return;
    }
    this.configSettingsFromStore$
      .pipe(
        take(1),
        tap((configSettings) => {
          const dialogRef = this.dialog.open(
            CompletedConfimationDialogComponent,
            {
              data: flatten(Object.keys(this.control.value).map((key) => {
                const replacedValue = configSettings[key];
                const replacingValue = this.control.value[key];
                return replacedValue !==  replacingValue?  [ {
                  name: key,
                  replacedValue,
                  replacingValue,
                }] : []
              })),
            }
          );
          dialogRef.afterClosed().pipe(
            tap((configSetting) => {
              this.store.dispatch(submitSaveRequest(configSetting));
            })
          );
        })
      )
      .subscribe();
  }

  async discardChanges() {
    // add your implementation here in lesson 3
    const configSettings = await lastValueFrom(
      this.configSettingsFromStore$.pipe(take(1))
    );
    this.control.reset(configSettings);
  }

  canDeactivate(): Observable<boolean> {
    // add your implmentation here in lesson 4
    return this._formHasChanges$.pipe(
      switchMap((hasChanged) => {
        console.log('hasChanged', hasChanged);
        if (!hasChanged) {
          return of(true);
        }
        {
          const dialogRef = this.dialog.open(
            CompletedDiscardChangesDialogComponent
          );
          return dialogRef.afterClosed();
        }
      })
    );
  }

  ngOnDestroy() {
    this._destroying$.next();
  }
}
