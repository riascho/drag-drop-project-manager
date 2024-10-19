import { Component } from "./base.js";
import { stateManager } from "./state-manager.js";
import { Autobind } from "../utils/autobind.js";
import { Validatable, validate } from "../utils/validation.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
