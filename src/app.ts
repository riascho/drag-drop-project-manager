type ProjectStatus = "active" | "finished";

class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type ListenerFunctionWithoutArguments = () => void;

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

function Autobind(
  _target: any,
  _methodName: string,
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

class StateManagement {
  protected listeners: ListenerFunctionWithoutArguments[] = [];
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

  private projects: Project[] = []; // whenever form is submitted, the project gets added here

  get storedProjects() {
    return [...this.projects];
  }

  private projectCounter: number = 1;

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      this.projectCounter,
      title,
      description,
      people,
      "active"
    );
    this.projects.push(newProject);
    this.updateListeners();
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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  activeContainer: T; // generic type for div element at bottom that will render our active elements
  activeElement: U; // generic type for content element that will be rendered (generic because it can be either a form element or simple element)

  constructor(
    templateId: string,
    activeContainerId: string,
    position: InsertPosition, // from https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
    newElementId?: string
  ) {
    const templateElement = document.getElementById(templateId);
    if (templateElement) {
      this.templateElement = templateElement as HTMLTemplateElement;
    } else {
      throw new Error(`HTML id ${templateId} is missing!`);
    }
    this.activeContainer = document.getElementById(activeContainerId)! as T;

    const originalTemplateElement = document.importNode(
      this.templateElement.content,
      true
    );

    this.activeElement = originalTemplateElement.firstElementChild as U; // stores the first element of the template element, which is a section element
    if (newElementId) {
      this.activeElement.id = newElementId; // attaches id (there's css for it) || overwrites the element id dynamically
    }

    this.attachActiveElements(position);
  }

  private attachActiveElements(position: InsertPosition) {
    this.activeContainer.insertAdjacentElement(position, this.activeElement);
  }

  protected abstract activate(): void;
  protected abstract renderContent(): void;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.titleInputElement = this.activeElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.activeElement.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.activeElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.activate();
  }

  activate() {
    this.activeElement.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private getUserInput(): [string, string, number] | void {
    const titleInput = this.titleInputElement.value;
    const descriptionInput = this.descriptionInputElement.value;
    const peopleInput = parseInt(this.peopleInputElement.value);

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

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
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

  constructor(private projectType: ProjectStatus) {
    super("project-list", "app", "beforeend", `${projectType}-projects`);

    this.activate();
    this.renderContent();

    this.projects = stateManager.storedProjects;
    this.renderProjects();
    console.log(`${this.projectType} projects rendered from ProjectList Class`);
  }

  activate() {
    stateManager.addListener(this.renderProjects);
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
    this.activeElement.addEventListener("dragover", this.dragOverHandler);
    this.activeElement.addEventListener("drop", this.dropHandler);
    this.activeElement.addEventListener("dragleave", this.dragLeaveHandler);
  }

  renderContent() {
    const listId = `${this.projectType}-projects-list`;
    const type = this.projectType.toUpperCase();
    this.activeElement.querySelector("h2")!.textContent = `${type} PROJECTS`;
    this.activeElement.querySelector("ul")!.id = listId;
  }

  @Autobind
  private renderProjects() {
    this.projects = stateManager.storedProjects;
    const listItemElement = document.getElementById(
      `${this.projectType}-projects-list`
    )! as HTMLUListElement;
    listItemElement.innerHTML = ""; // clear project list
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
  private project: Project;

  constructor(hostId: string, project: Project) {
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

const stateManager = ProjectStateManagement.setInstance();

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
