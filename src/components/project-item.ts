/// <reference path="base.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/drag-and-drop.ts" />
/// <reference path="../models/project.ts" />

namespace App {
  export class ProjectItem
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
}
