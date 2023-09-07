import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';

const stats = ['attack', 'defense', 'speed', 'health'];

const MIN_SINGLE_STAT = 0;
const MAX_SINGLE_STAT = 20;
const MAX_TOTAL_STATS = 60;

const singleStatValidators = [
  Validators.required,
  Validators.min(MIN_SINGLE_STAT),
  Validators.max(MAX_SINGLE_STAT),
];

const heroValidator: ValidatorFn = (control: FormGroup) => {
  const stats = control.value;
  console.log('stats', stats);
  const statsValuesSomme = (Object.values(stats) as number[]).reduce(
    (somme, stat) => {
      return (somme + stat) as number;
    },
    0 as number
  );
  console.log('statsValuesSomme', statsValuesSomme);
  return statsValuesSomme > 60 ? { maxTotal: statsValuesSomme } : null;
};

const createSingleStatControl = () => new FormControl(0, singleStatValidators);

@Component({
  selector: 'forms-course-hero-validation-2',
  templateUrl: './hero-validation.component.html',
  styleUrls: ['./hero-validation.component.css'],
})
export class HeroValidationComponent {
  formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    stats: new FormGroup(
      {
        attack: createSingleStatControl(),
        defense: createSingleStatControl(),
        speed: createSingleStatControl(),
        health: createSingleStatControl(),
      },
      heroValidator
    ),
  });
  stats = stats;
  get statsGroup() {
    return this.formGroup.get('stats') as FormGroup;
  }
  get name() {
    return this.formGroup.get('name') as FormControl;
  }
}
