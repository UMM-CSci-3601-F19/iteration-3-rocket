import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {User} from './user';
import {FormControl, Validators, FormGroup, FormBuilder} from "@angular/forms";
import {NameValidator} from "./name.validator";

@Component({
  selector: 'add-user.component',
  templateUrl: 'add-user.component.html',
})
export class AddUserComponent implements OnInit {

  addUserForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: User }, private fb: FormBuilder) {
  }

  // not sure if this name is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  add_user_validation_messages = {
    'name': [
      {type: 'required', message: 'Name is required'},
      {type: 'minlength', message: 'Name must be at least 2 characters long'},
      {type: 'maxlength', message: 'Name cannot be more than 25 characters long'},
      {type: 'pattern', message: 'Name must contain only numbers and letters'},
      {type: 'existingName', message: 'Name has already been taken'}
    ],

    'age': [
      {type: 'pattern', message: 'Age must be a number'},
      {type: 'min', message: 'Age must be at least 15'},
      {type: 'max', message: 'Age may not be greater than 200'},
      {type: 'required', message: 'Age is required'}
    ],

    'email': [
      {type: 'email', message: 'Email must be formatted properly'}
    ]
  };

  createForms() {

    // add user form validations
    this.addUserForm = this.fb.group({
      // We allow alphanumeric input and limit the length for name.
      name: new FormControl('name', Validators.compose([
        NameValidator.validName,
        Validators.minLength(2),
        Validators.maxLength(25),
        Validators.pattern('^[A-Za-z0-9\\s]+[A-Za-z0-9\\s]+$(\\.0-9+)?'),
        Validators.required
      ])),

      // Since this is for a company, we need workers to be old enough to work, and probably not older than 200.
      age: new FormControl('age', Validators.compose([
        Validators.pattern('^[0-9]+[0-9]?'),
        Validators.min(15),
        Validators.max(200),
        Validators.required
      ])),

      // We don't care much about what is in the company field, so we just add it here as part of the form
      // without any particular validation.
      company: new FormControl('company'),

      // We don't need a special validator just for our app here, but there is a default one for email.
      email: new FormControl('email', Validators.email)
    })

  }

  ngOnInit() {
    this.createForms();
  }

}
