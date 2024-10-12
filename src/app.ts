// TYPES

enum ProjectStatus {
  Active, // 0
  Finished, // 1
}

// using a class type for the project items so we can instantiate it
class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// define the type of functions that are passed to the listeners collection to be called by the state manager in an event (dynamics)
type ListenerFunctionWithoutArguments = () => void;
// type ListenerFunctionWithArguments = (items: Project[]) => void; // when we need to be more restrictive to make sure these functions always contain parameters

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// METHODS

// Autobind Decorator
function Autobind(
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

// CLASSES

class ProjectStateManagement {
  // Singleton -> this class can only be instantiated once (as global object to be used throughout the app)
  private constructor() {}
  private static instance: ProjectStateManagement;
  static setInstance() {
    if (ProjectStateManagement.instance) {
      return this.instance;
    }
    this.instance = new ProjectStateManagement();
    return this.instance;
  }

  // whenever form is submitted, the project gets added to here:
  private projects: Project[] = [];

  // getter method to return current project list
  get storedProjects() {
    return [...this.projects];
  }

  // public method, can be called from outside of class to add new projects
  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      1, // TODO: add function to increment id automatically
      title,
      description,
      people,
      ProjectStatus.Active // adds "active" status by default
    );
    this.projects.push(newProject);
    // when project is added invoke() all functions in listener collection again
    for (const listener of this.listeners) {
      listener();
    }
  }

  // collection of functions from other classes that need to be shared across
  private listeners: ListenerFunctionWithoutArguments[] = [];
  // same as: private listeners: (() => void)[] = [];
  // public method, that lets other classes add their functions to the listeners collection
  addListener(listenerFunction: ListenerFunctionWithoutArguments) {
    this.listeners.push(() => {
      listenerFunction(); // push the actual function so it can be invoked when iterated (need to do that using a callback) otherwise you are just pushing the function reference
    });
  }
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
      this.clearFormFields();
      return [titleInput, descriptionInput, peopleInput];
    }
  }

  // will trigger on when form is submitted
  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault(); // remove default behavior (send HTTP request upon submission)
    // what to do when form is submitted
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      // .isArray method to check if it's a tuple (which is an array essentially)
      // if true, we got our valid input tuple
      const [title, description, people] = userInput;
      stateManager.addProject(title, description, people);
      console.log("Project Collection:");
      console.log(stateManager.storedProjects);
    }
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
    // however, this can be achieved with a method decorator (Autobind)
  }
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  activeDiv: HTMLDivElement;
  element: HTMLElement;
  projects: Project[];

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

    // this.projects = stateManager.storedProjects; // gets current project collection from state manager
    this.projects = [];
    // registers the renderProjects function to the state manager, so it can be called from elsewhere
    stateManager.addListener(this.renderProjects);

    this.attachToActiveDiv();
    this.renderContent();
    this.renderProjects(); // initial setup from database
    console.log(`${this.projectType} projects rendered from ProjectList Class`);
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

  @Autobind // The @Autobind decorator is applied to ensure it retains the correct '.this' context when called (from the state manager instance for example)
  private renderProjects() {
    this.projects = stateManager.storedProjects; // gets current project collection from state manager
    // get the element the project list item will be attached to
    const listItemElement = document.getElementById(
      `${this.projectType}-projects-list`
    )! as HTMLUListElement;
    // looping through stored projects array (from state manager)
    for (const projectItem of this.projects) {
      const newListItem = document.createElement("li");
      newListItem.textContent = projectItem.title;
      listItemElement.appendChild(newListItem);
    }
  }
}

// CLASS INSTANCES

// this is a global instance (singleton) that can be used to interact between classes
const stateManager = ProjectStateManagement.setInstance();

// when class is instantiated the rendering is executed and will show up in browser
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
