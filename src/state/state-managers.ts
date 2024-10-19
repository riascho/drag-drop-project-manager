namespace App {
  // define the type of functions that are passed to the listeners collection to be called by the state manager in an event (dynamics)
  type ListenerFunctionWithoutArguments = () => void;
  // type ListenerFunctionWithArguments = (items: Project[]) => void; // when we need to be more restrictive to make sure these functions always contain parameters

  export class StateManagement {
    // collection of functions from other classes that need to be shared across
    protected listeners: ListenerFunctionWithoutArguments[] = [];
    // same as: private listeners: (() => void)[] = [];
    // public method, that lets other classes add their functions to the listeners collection
    addListener(listenerFunction: ListenerFunctionWithoutArguments) {
      this.listeners.push(() => {
        listenerFunction(); // push the actual function so it can be invoked when iterated (need to do that using a callback) otherwise you are just pushing the function reference
      });
    }

    protected updateListeners() {
      for (const listener of this.listeners) {
        listener();
      }
    }
  }

  export class ProjectStateManagement extends StateManagement {
    // Singleton -> this class can only be instantiated once (as global object to be used throughout the app)
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

    // whenever form is submitted, the project gets added to here:
    private projects: Project[] = [];

    // getter method to return current project list
    get storedProjects() {
      return [...this.projects];
    }

    private projectCounter: number = 1;

    // public method, can be called from outside of class to add new projects
    addProject(title: string, description: string, people: number) {
      const newProject = new Project(
        this.projectCounter,
        title,
        description,
        people,
        "active" // adds "active" status by default
      );
      this.projects.push(newProject);
      // runs the global listeners to trigger render change
      this.updateListeners();
      // increments project counter for new id
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

  // this is a global instance (singleton) that can be used to interact between classes
  export const stateManager = ProjectStateManagement.setInstance();
}
