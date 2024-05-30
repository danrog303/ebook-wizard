import {AbstractControl, FormGroup, ValidatorFn} from "@angular/forms";

export default function passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        try {
            const pwd = control.parent?.get(password);
            const confirmPwd = control.parent?.get(confirmPassword);
            return pwd?.value === confirmPwd?.value ? null : { passwordMismatch: true };
        } catch (e) {
            return null;
        }
    };
}
