/// <reference path="base.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/state-managers.ts" />
/// <reference path="../models/drag-and-drop.ts" />
/// <reference path="../models/project.ts" />

namespace App {
  export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    projects: Project[];

    // constructor needs parameter to define which type the project will be that gets added to the list
    // union type of literals because we will only have two categories
    constructor(private projectType: ProjectStatus) {
      super("project-list", "app", "beforeend", `${projectType}-projects`);

      this.activate();
      this.renderContent();

      // this.projects = stateManager.storedProjects; // gets current project collection from state manager
      this.projects = [];
      this.renderProjects(); // initial setup from database
      console.log(
        `${this.projectType} projects rendered from ProjectList Class`
      );
    }

    activate() {
      // registers the renderProjects function to the state manager, so it can be called from elsewhere
      stateManager.addListener(this.renderProjects);
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
      this.activeElement.addEventListener("dragover", this.dragOverHandler);
      this.activeElement.addEventListener("drop", this.dropHandler);
      this.activeElement.addEventListener("dragleave", this.dragLeaveHandler);
    }

    // to fill the template element tags in the active element
    renderContent() {
      const listId = `${this.projectType}-projects-list`;
      const type = this.projectType.toUpperCase();
      this.activeElement.querySelector("h2")!.textContent = `${type} PROJECTS`;
      this.activeElement.querySelector("ul")!.id = listId;
    }

    @Autobind // The @Autobind decorator is applied to ensure it retains the correct '.this' context when called (from the state manager instance for example)
    private renderProjects() {
      this.projects = stateManager.storedProjects; // gets current project collection from state manager
      // get the element the project list item will be attached to
      const listItemElement = document.getElementById(
        `${this.projectType}-projects-list`
      )! as HTMLUListElement;
      // clear the list
      // TODO: for performance it would be better to not fetch the whole list every time, but to only really append new items
      listItemElement.innerHTML = "";
      // looping through stored projects array (from state manager)
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
}
