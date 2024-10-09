// Autobind Decorator
function EventBinder(
  _target: any, // 'prototype of class (ProjectInput)'
  _methodName: string, // 'activateSubmitButton'
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value; // this addresses the element value the eventhandler is executed on
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return newDescriptor;
}

// Validation Object
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

// Validation Decorator
function IsRequired(target: any, propertyName: string) {
  validationChecks[target.constructor.name] = { propertyName: [] };
}

function IsPositiveNumber(target: any, propertyName: string) {}

function IsText(target: any, propertyName: string) {}

function validateClassObject(obj: any) {
  const validationCheckPoint = validationChecks[obj.constructor.name];
  let isValid = true;
  if (!validationCheckPoint) {
    // if there is no validation check for the class object, return true by default
    return isValid;
  } // else we will loop through each of the properties that have been registered for validation
  for (const prop in validationChecks) {
    for (const check of validationChecks[prop]) {
      switch (check) {
        case "required": // TODO: these cases should be spec'ed in a single source and not hardcoded!
          isValid = !!obj[prop];
          break;
        case "positiveNumber":
          isValid = obj[prop] > 0;
          break;
        // case "textCharacter":
        //   isValid = String.isChar(obj[prop]);
      }
    }
  }
  return isValid;
}

// Classes
class ProjectInput {
  templateElement: HTMLTemplateElement; // template tag element with id 'project-input'
  activeDiv: HTMLDivElement; // div element at bottom that will render our active elements
  formElement: HTMLFormElement; // actual content to be put in active div (copied from template, to be a form element)
  titleInputElement: HTMLInputElement; // title form input field
  descriptionInputElement: HTMLInputElement; // description form input field
  peopleInputElement: HTMLInputElement; // people form input field

  constructor() {
    // checking for existing id
    const templateElement = document.getElementById("project-input");
    if (templateElement) {
      this.templateElement = templateElement as HTMLTemplateElement;
    } else {
      throw new Error("HTML id project-input is missing!");
    }

    // implying that "app" id will always exist
    this.activeDiv = document.getElementById("app")! as HTMLDivElement;

    // imports current html content of template element
    const originalTemplateElement = document.importNode(
      this.templateElement.content,
      true
    );

    // grabs the first child element of the project-input template element
    this.formElement =
      originalTemplateElement.firstElementChild as HTMLFormElement;
    this.formElement.id = "user-input"; // attaches id (there's css for it)

    // initialize the input fields to get access to input from form
    this.titleInputElement = this.formElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.formElement.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.formElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    // runs the attach method when class is instantiated (constructor is called and creates .this context)
    this.attachActiveElements();
    // runs this method to activate button submission listener when the class is instantiated
    this.activateSubmitButton();
  }

  private attachActiveElements() {
    // adds the grabbed template element to the active div element
    this.activeDiv.insertAdjacentElement("afterbegin", this.formElement);
  }

  private getUserInput(): [string, string, number] | void {
    const titleInput = this.titleInputElement.value;
    const descriptionInput = this.descriptionInputElement.value;
    const peopleInput = this.peopleInputElement.value;
    // vanilla approach - should be done with a validation decorator
    if (
      titleInput.trim().length === 0 ||
      descriptionInput.trim().length === 0 ||
      peopleInput.trim().length === 0
    ) {
      alert("Please enter a value!");
    } else {
      return [titleInput, descriptionInput, parseInt(peopleInput)];
    }
  }

  // will trigger on when form is submitted
  @EventBinder
  private submitHandler(event: Event) {
    event.preventDefault(); // remove default behavior (send HTTP request upon submission)
    // what to do when form is submitted
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      // .isArray method to check if it's a tuple (which is an array essentially)
      // if true, we got our valid input tuple
      const [title, description, people] = userInput;
      console.log(title);
      console.log(description);
      console.log(people);
    }
    this.clearFormFields();
  }

  private clearFormFields() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private activateSubmitButton() {
    // form elements can have a submit event! (better than the button)

    // this.formElement
    //   .querySelector("button")
    //   ?.addEventListener("click", () => {});
    this.formElement.addEventListener("submit", this.submitHandler);
    // 'this' context within a callback will be bound to the target of the event ! (not the class)
    // this.formElement.addEventListener("submit", this.submitHandler.bind(this)); // binding 'this' context to the class
    // however, this can be achieved with a method decorator (EventBinder)
  }
}

// Class Objects (Instances)

// when class is instantiated the rendering is executed and will show up in browser
const start = new ProjectInput();
