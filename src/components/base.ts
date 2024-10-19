export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  activeContainer: T;
  activeElement: U;

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

    this.activeElement = originalTemplateElement.firstElementChild as U;
    if (newElementId) {
      this.activeElement.id = newElementId;
    }

    this.attachActiveElements(position);
  }

  private attachActiveElements(position: InsertPosition) {
    this.activeContainer.insertAdjacentElement(position, this.activeElement);
  }

  protected abstract activate(): void;
  protected abstract renderContent(): void;
}
