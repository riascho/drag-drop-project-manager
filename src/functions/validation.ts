import { Validatable } from "../interfaces/interfaces";

export function validate(input: Validatable) {
  let isValid = true;
  if (input.required) {
    // if required is set as validation check -> check if value is set
    isValid = isValid && !!input.value; // if it's 0 or empty string will be falsy, !! double bang converts it into a false value
  }
  if (input.minLength != null && typeof input.value === "string") {
    // if minLength is set as a validation check (only necessary for string inputs)
    isValid = isValid && input.value.length > input.minLength;
  }
  if (input.maxLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length < input.maxLength;
  }
  if (input.min != null && typeof input.value === "number") {
    isValid = isValid && input.value >= input.min;
  }
  if (input.max != null && typeof input.value === "number") {
    isValid = isValid && input.value <= input.max;
  }
  return isValid;
}
