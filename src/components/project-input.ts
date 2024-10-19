/// <reference path="base.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../util/validation.ts" />
/// <reference path="../state/state-managers.ts" />

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}
