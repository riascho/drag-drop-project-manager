class ProjectInput {
  templateElement: HTMLTemplateElement;
  activeDiv: HTMLDivElement;
  element: HTMLFormElement;

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
    this.element = originalTemplateElement.firstElementChild as HTMLFormElement;

    // runs the attach method when class is instantiated (constructor is called and creates .this context)
    this.attach();
  }

  private attach() {
    // adds the grabbed template element to the active div element
    this.activeDiv.insertAdjacentElement("afterbegin", this.element);
  }
}

// when class is instantiated the rendering is executed and will show up in browser

const start = new ProjectInput();
