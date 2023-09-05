import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'forms-course-bootstap-example',
  templateUrl: './bootstap-example.component.html',
  styleUrls: ['./bootstap-example.component.css'],
})
export class BootstapExampleComponent {
  form = new FormGroup({
    input: new FormControl('', [Validators.required, Validators.maxLength(10)]),
  });
  get inputControl() {
    return this.form.get('input') as FormControl;
  }
  submit() {
    if (this.form.valid) {
      alert('Submitted!');
    }
  }
}
