// TODO: make project id's incrementable (and not static)

// TYPES

// decided not use enum because I have no functionality for the 0 or 1
// enum ProjectStatus {
//   Active, // 0
//   Finished, // 1
// }

type ProjectStatus = "active" | "finished";

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

// using interfaces when we want to add specific types and structures to certain classes or objects to implement certain methods
interface Draggable {
  // e.g. ProjectItem class
  dragStartHandler(event: DragEvent): void; // when it becomes draggable
  dragEndHandler(event: DragEvent): void; // when it stops to be draggable
}

interface DragTarget {
  // e.g. ProjectList class
  dragOverHandler(event: DragEvent): void; // permit the drop
  dropHandler(event: DragEvent): void; // handle the drop
  dragLeaveHandler(event: DragEvent): void; // visual feedback after drop or abort
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

class StateManagement {
  // collection of functions from other classes that need to be shared across
  protected listeners: ListenerFunctionWithoutArguments[] = [];
  // same as: private listeners: (() => void)[] = [];
  // public method, that lets other classes add their functions to the listeners collection
  addListener(listenerFunction: ListenerFunctionWithoutArguments) {
    this.listeners.push(() => {
      listenerFunction(); // push the actual function so it can be invoked when iterated (need to do that using a callback) otherwise you are just pushing the function reference
    });
  }

  protected updateListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

class ProjectStateManagement extends StateManagement {
  // Singleton -> this class can only be instantiated once (as global object to be used throughout the app)
  private constructor() {
    super();
  }
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

  private projectCounter: number = 1;

  // public method, can be called from outside of class to add new projects
  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      this.projectCounter,
      title,
      description,
      people,
      "active" // adds "active" status by default
    );
    this.projects.push(newProject);
    // runs the global listeners to trigger render change
    this.updateListeners();
    // increments project counter for new id
    this.projectCounter++;
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const foundProject = this.projects.find(
      (project) => project.id.toString() === projectId
    );
    if (foundProject && foundProject.status !== newStatus) {
      foundProject.status = newStatus;
      this.updateListeners();
    }
  }
}

// abstract class because we only need this class for inheritance and shall not be instantiated
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  // find different types but their common ground
  templateElement: HTMLTemplateElement; // template tag element with id 'project-input'
  activeContainer: T; // generic type for div element at bottom that will render our active elements
  activeElement: U; // generic type for content element that will be rendered (generic because it can be either a form element or simple element)

  constructor(
    // these arguments will be defined in the super() method in the subclass
    templateId: string,
    activeContainerId: string,
    position: InsertPosition, // from https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
    newElementId?: string
  ) {
    // checking for existing id
    const templateElement = document.getElementById(templateId);
    if (templateElement) {
      this.templateElement = templateElement as HTMLTemplateElement;
    } else {
      throw new Error(`HTML id ${templateId} is missing!`);
    }
    this.activeContainer = document.getElementById(activeContainerId)! as T;

    // imports current html content of template element
    const originalTemplateElement = document.importNode(
      this.templateElement.content,
      true // 'deep': if true, the copy also includes the node's descendants.
    );

    // grabs the first child element of the project-input template element
    this.activeElement = originalTemplateElement.firstElementChild as U; // stores the first element of the template element, which is a section element
    if (newElementId) {
      this.activeElement.id = newElementId; // attaches id (there's css for it) || overwrites the element id dynamically
    }

    // runs the attach method when class is instantiated (constructor is called and creates .this context)
    this.attachActiveElements(position);
  }

  private attachActiveElements(position: InsertPosition) {
    // adds the grabbed template element to the active div element
    this.activeContainer.insertAdjacentElement(position, this.activeElement);
    // will add project-input form just inside the targetElement, before its first child.
  }

  // abstract methods for inheritance -> the implementation is up to the subclass but they are forced to at least have these methods
  protected abstract activate(): void;
  protected abstract renderContent(): void;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement; // title form input field
  descriptionInputElement: HTMLInputElement; // description form input field
  peopleInputElement: HTMLInputElement; // people form input field
  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    // initialize the input fields to get access to input from form
    this.titleInputElement = this.activeElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.activeElement.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.activeElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    // runs this method to activate button submission listener when the class is instantiated
    this.activate();
  }

  activate() {
    // form elements can have a submit event! (better than the button)

    // this.formElement
    //   .querySelector("button")
    //   ?.addEventListener("click", () => {});
    this.activeElement.addEventListener("submit", this.submitHandler);
    // 'this' context within a callback will be bound to the target of the event ! (not the class)
    // this.formElement.addEventListener("submit", this.submitHandler.bind(this)); // binding 'this' context to the class
    // however, this can be achieved with a method decorator (Autobind)
  }

  renderContent() {}

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
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  projects: Project[];

  // constructor needs parameter to define which type the project will be that gets added to the list
  // union type of literals because we will only have two categories
  constructor(private projectType: ProjectStatus) {
    super("project-list", "app", "beforeend", `${projectType}-projects`);

    this.activate();
    this.renderContent();

    // this.projects = stateManager.storedProjects; // gets current project collection from state manager
    this.projects = [];
    this.renderProjects(); // initial setup from database
    console.log(`${this.projectType} projects rendered from ProjectList Class`);
  }

  activate() {
    // registers the renderProjects function to the state manager, so it can be called from elsewhere
    stateManager.addListener(this.renderProjects);
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
    this.activeElement.addEventListener("dragover", this.dragOverHandler);
    this.activeElement.addEventListener("drop", this.dropHandler);
    this.activeElement.addEventListener("dragleave", this.dragLeaveHandler);
  }

  // to fill the template element tags in the active element
  renderContent() {
    const listId = `${this.projectType}-projects-list`;
    const type = this.projectType.toUpperCase();
    this.activeElement.querySelector("h2")!.textContent = `${type} PROJECTS`;
    this.activeElement.querySelector("ul")!.id = listId;
  }

  @Autobind // The @Autobind decorator is applied to ensure it retains the correct '.this' context when called (from the state manager instance for example)
  private renderProjects() {
    this.projects = stateManager.storedProjects; // gets current project collection from state manager
    // get the element the project list item will be attached to
    const listItemElement = document.getElementById(
      `${this.projectType}-projects-list`
    )! as HTMLUListElement;
    // clear the list
    // TODO: for performance it would be better to not fetch the whole list every time, but to only really append new items
    listItemElement.innerHTML = "";
    // looping through stored projects array (from state manager)
    for (const projectItem of this.projects) {
      if (projectItem.status === this.projectType) {
        new ProjectItem(
          this.activeElement.querySelector("ul")!.id,
          projectItem
        );
      }
    }
  }

  @Autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listElement = this.activeElement.querySelector("ul")!;
      listElement.classList.add("droppable", "expanded");
      listElement.classList.replace("collapsed", "expanded");
    }
  }

  @Autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    stateManager.moveProject(projectId, this.projectType);
  }

  @Autobind
  dragLeaveHandler(_event: DragEvent): void {
    const listElement = this.activeElement.querySelector("ul")!;
    listElement.classList.remove("droppable", "collapsed");
    listElement.classList.replace("expanded", "collapsed");
  }
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  // this enforces that we implement the Draggable methods!
  // T corresponds to the element where our project items will be placed in
  // U is the item we want to place in T

  private project: Project;

  constructor(hostId: string, project: Project) {
    // add project status here
    super("single-project", hostId, "afterbegin", project.id.toString());
    this.project = project;
    this.activate();
    this.renderContent();
  }

  protected activate(): void {
    this.activeElement.addEventListener("dragstart", this.dragStartHandler);
    this.activeElement.addEventListener("dragend", this.dragEndHandler);
  }

  protected renderContent(): void {
    this.activeElement.querySelector("h2")!.textContent = this.project.title;
    this.activeElement.querySelector("h3")!.textContent =
      this.project.people > 1
        ? `${this.project.people} People`
        : `${this.project.people} Person`;
    this.activeElement.querySelector("p")!.textContent =
      this.project.description;
  }

  @Autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id.toString());
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_event: DragEvent): void {
    console.log("Drag ended");
  }
}

// CLASS INSTANCES

// this is a global instance (singleton) that can be used to interact between classes
const stateManager = ProjectStateManagement.setInstance();

// when class is instantiated the rendering is executed and will show up in browser
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
