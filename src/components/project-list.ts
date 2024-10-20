import { Component } from "./base.js";
import { stateManager } from "./state-manager.js";
import { ProjectItem } from "./project-item.js";
import { DragTarget } from "../models/drag-and-drop.js";
import { Project, ProjectStatus } from "../models/project.js";
import Autobind from "../utils/autobind.js";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  projects: Project[];

  constructor(private projectType: ProjectStatus) {
    super("project-list", "app", "beforeend", `${projectType}-projects`);

    this.activate();
    this.renderContent();

    this.projects = [];
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
    listItemElement.innerHTML = "";
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
