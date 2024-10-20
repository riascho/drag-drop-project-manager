export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
