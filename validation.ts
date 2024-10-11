// first attempt (before solution) -> TODO: implement with decorators later at some point

interface Validator {
  [classObjectConstructorName: string]: {
    [propertyToValidate: string]: string[];
  };
}

const validationChecks: Validator = {};
/**
 * {
 *    ProjectInput:
 *        {
 *            titleInputElement: ['required', 'textCharacter']
              descriptionInputElement: ['required', 'textCharacter']
              peopleInputElement: ['required', 'positiveNumber']
 *        }
 * }
 * 
 */

// Validation Decorators -> to be applied to class properties
function IsRequired(target: any, propertyName: string) {
  validationChecks[target.constructor.name] = { propertyName: [] };
}
function IsPositiveNumber(target: any, propertyName: string) {}
function IsText(target: any, propertyName: string) {}

// Validation Function -> run for entire class for properties that have a validation decorator

/** */

function validateAll(): boolean {
  const validationCheckPoint = validationChecks[obj.constructor.name];
  let isValid = true;
  if (!validationCheckPoint) {
    // if there is no validation check for the class object, return true by default
    return isValid;
  } // else we will loop through each of the properties that have been registered for validation
  for (const prop in validationChecks) {
    for (const check of prop) {
      switch (check) {
        case "required": // TODO: these cases should be spec'ed in a single source and not hardcoded!
          isValid = isValid && !!prop;
          break;
        case "positiveNumber":
          isValid = isValid && prop > 0;
          break;
        // case "textCharacter":
        //   isValid = String.isChar(obj[prop]);
      }
    }
  }
  return isValid;
}
