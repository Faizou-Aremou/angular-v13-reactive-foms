import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../api.service';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class UniqueNameValidator implements AsyncValidator {
  constructor(private api: ApiService) {}
  validate(
    form: AbstractControl
  ): Promise<ValidationErrors> | Observable<ValidationErrors> {
    const fullName = form.value;
    return this.api.alreadyExists$(fullName).pipe(
      map((isExist) => {
        return isExist ? { uniqueName: fullName } : null;
      })
    );
  }
}
