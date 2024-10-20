import { Component } from "./base.js";
import { Draggable } from "../models/drag-and-drop.js";
import { Project } from "../models/project.js";
import Autobind from "../utils/autobind.js";

export class ProjectItem
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
