import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {AddUserComponent} from './add-user.component';
import {CustomModule} from '../custom.module';
import {By} from '@angular/platform-browser';
import {NgForm} from '@angular/forms';

describe('Add user component', () => {

  let addUserComponent: AddUserComponent;
  let calledClose: boolean;
  const mockMatDialogRef = {
    close() {
      calledClose = true;
    }
  };
  let fixture: ComponentFixture<AddUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [AddUserComponent],
      providers: [
        {provide: MatDialogRef, useValue: mockMatDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: null}]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    calledClose = false;
    fixture = TestBed.createComponent(AddUserComponent);
    addUserComponent = fixture.componentInstance;
  });
/*
  // Much of the code for validation was created with a lot of exploration and helpful resources including:
  // https://stackoverflow.com/questions/39910017/angular-2-custom-validation-unit-testing
  // https://stackoverflow.com/questions/52046741/angular-testbed-query-by-css-find-the-pseudo-element
  // https://angular.io/guide/form-validation
  // https://github.com/angular/angular/blob/7.2.2/packages/forms/src/validators.ts#L136-L157
  it('should not allow a name to contain a symbol', async( () => {
    // tslint:disable-next-line:no-shadowed-variable
    const fixture = TestBed.createComponent(AddUserComponent);
    const debug = fixture.debugElement;
    const input = debug.query(By.css('[name=email]'));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      input.nativeElement.value = 'bad@email.com';
      dispatchEvent(input.nativeElement);
      fixture.detectChanges();

      const form: NgForm = debug.children[0].injector.get(NgForm);
      const control = form.control.get('email');
      expect(control.hasError('notPeeskillet')).toBe(true);
      expect(form.control.valid).toEqual(false);
      expect(form.control.hasError('notPeeskillet', ['email'])).toEqual(true);

      input.nativeElement.value = 'peeskillet@stackoverflow.com';
      dispatchEvent(input.nativeElement);
      fixture.detectChanges();

      expect(control.hasError('notPeeskillet')).toBe(false);
      expect(form.control.valid).toEqual(true);
      expect(form.control.hasError('notPeeskillet', ['email'])).toEqual(false);
    });
  })
  );*/
});
