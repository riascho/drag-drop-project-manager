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

  // will trigger on when form is submitted
  @EventBinder
  private submitHandler(event: Event) {
    event.preventDefault(); // remove default behavior (send HTTP request upon submission)
    // what to do when form is submitted
    console.log(this.titleInputElement.value);
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

// when class is instantiated the rendering is executed and will show up in browser

const start = new ProjectInput();
