namespace App {
  export interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function validate(input: Validatable) {
    // contains all validation checks
    let isValid = true; // will be set to false if any validation check fails
    if (input.required) {
      // if required is set as validation check -> check if value is set
      isValid = isValid && !!input.value; // if it's 0 or empty string will be falsy, !! double bang converts it into a false value
      // isValid && !!input.value ? true : alert(`${input.value} required!`);
    }
    if (input.minLength != null && typeof input.value === "string") {
      // if minLength is set as a validation check (only necessary for string inputs)
      isValid = isValid && input.value.length > input.minLength;
      //   ? true
      //   : alert(`${input.value} needs at least ${input.minLength} characters.`);
    }
    if (input.maxLength != null && typeof input.value === "string") {
      isValid = isValid && input.value.length < input.maxLength;
      //   ? true
      //   : alert(
      //       `${input.value} can only have a maximum of ${input.maxLength} characters.`
      // );
    }
    if (input.min != null && typeof input.value === "number") {
      isValid = isValid && input.value >= input.min;
      //   ? true
      //   : alert(`${input.value} needs a minimum of ${input.min} people.`);
    }
    if (input.max != null && typeof input.value === "number") {
      isValid = isValid && input.value <= input.max;
      //   ? true
      //   : alert(`${input.value} can only have a maximum of ${input.max} people.`);
    }
    return isValid; // TODO: make this nicer, so an alert is shown for the specific validation failure and
  }
}
