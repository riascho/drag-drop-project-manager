namespace App {
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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
}
