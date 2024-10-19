import { Project, ProjectStatus } from "../models/project.js";

type ListenerFunctionWithoutArguments = () => void;

export class StateManagement {
  protected listeners: ListenerFunctionWithoutArguments[] = [];
  addListener(listenerFunction: ListenerFunctionWithoutArguments) {
    this.listeners.push(() => {
      listenerFunction();
    });
  }

  protected updateListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export class ProjectStateManagement extends StateManagement {
  private constructor() {
    super();
  }
  private static instance: ProjectStateManagement;
  static setInstance() {
    if (ProjectStateManagement.instance) {
      return this.instance;
    }
    this.instance = new ProjectStateManagement();
    return this.instance;
  }

  private projects: Project[] = [];

  get storedProjects() {
    return [...this.projects];
  }

  private projectCounter: number = 1;

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      this.projectCounter,
      title,
      description,
      people,
      "active"
    );
    this.projects.push(newProject);
    this.updateListeners();
    this.projectCounter++;
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const foundProject = this.projects.find(
      (project) => project.id.toString() === projectId
    );
    if (foundProject && foundProject.status !== newStatus) {
      foundProject.status = newStatus;
      this.updateListeners();
    }
  }
}

export const stateManager = ProjectStateManagement.setInstance();
