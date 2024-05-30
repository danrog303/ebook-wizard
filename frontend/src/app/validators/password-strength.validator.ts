import {AbstractControl, ValidatorFn} from "@angular/forms";

const passwordStrengthValidator: ValidatorFn = (control: AbstractControl) => {
    const password: string = control.value;
    if (!password) {
        return null;
    }

    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasNumber || !hasSpecialCharacter) {
        return { passwordStrength: true };
    }
    return null;
}

export default passwordStrengthValidator;
