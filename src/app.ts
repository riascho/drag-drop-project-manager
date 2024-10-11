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

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
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
      throw new Error("HTML id 'project-input' is missing!");
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
    // will add project-input form just inside the targetElement, before its first child.
  }

  private getUserInput(): [string, string, number] | void {
    const titleInput = this.titleInputElement.value;
    const descriptionInput = this.descriptionInputElement.value;
    const peopleInput = parseInt(this.peopleInputElement.value);

    // vanilla approach - should be done with a validation decorator
    // if (
    //   titleInput.trim().length === 0 ||
    //   descriptionInput.trim().length === 0 ||
    //   peopleInput.trim().length === 0
    // ) {
    //   alert("Please enter a value!");
    // } else {
    //   return [titleInput, descriptionInput, parseInt(peopleInput)];
    // }

    const validTitle: Validatable = {
      value: titleInput,
      required: true,
      minLength: 3,
    };
    const validDescription: Validatable = {
      value: descriptionInput,
      required: true,
      minLength: 5,
      maxLength: 150,
    };
    const validPeople: Validatable = {
      value: peopleInput,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      // either of them is false
      !validate(validTitle) ||
      !validate(validDescription) ||
      !validate(validPeople)
    ) {
      alert("Invalid Input! Please try again!");
      return;
    } else {
      return [titleInput, descriptionInput, peopleInput];
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

class ProjectList {
  templateElement: HTMLTemplateElement;
  activeDiv: HTMLDivElement;
  element: HTMLElement;

  // constructor needs parameter to define which type the project will be that gets added to the list
  // union type of literals because we will only have two categories
  constructor(private projectType: "active" | "finished") {
    const templateElement = document.getElementById("project-list");
    if (templateElement) {
      this.templateElement = templateElement as HTMLTemplateElement;
    } else {
      throw new Error("HTML id 'project-list' is missing!");
    }
    this.activeDiv = document.getElementById("app")! as HTMLDivElement;
    const originalTemplateElement = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = originalTemplateElement.firstElementChild as HTMLElement; // stores the first element of the template element, which is a section element
    this.element.id = `${this.projectType}-projects`; // overwrites the section element id dynamically

    this.attachToActiveDiv();
    this.renderContent();
  }

  private attachToActiveDiv() {
    this.activeDiv.insertAdjacentElement("beforeend", this.element);
    // will add project-list just inside the targetElement, after its last child.
  }

  // to fill the template element tags in the active element
  private renderContent() {
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.projectType.toUpperCase()} PROJECTS`;
    this.element.querySelector("ul")!.id = `${this.projectType}-projects-list`;
  }
}

// Class Objects (Instances)

// when class is instantiated the rendering is executed and will show up in browser
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
