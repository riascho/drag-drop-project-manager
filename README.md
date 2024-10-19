# Drag & Drop Project Manager

This is TypeScript project of an app that let's you manage projects by drag-and-drop. From the course [Boost your JavaScript projects with TypeScript](https://www.udemy.com/course/understanding-typescript/)

There are 2 additional branches to demonstrate the concept of modularization:

- using [Namespaces](https://github.com/riascho/drag-drop-project-manager/tree/namespaces)
- using [ES Modules](https://github.com/riascho/drag-drop-project-manager/tree/es-modules)

---

## Step 1: DOM Element Selection & OOP Rendering

- create class `project-input` with constructors properties that contain DOM elements we want to address
- import template elements content
- attach grabbed template content to active div for rendering
- all of the above happens in the constructor, so that it is executed when the class is instantiated

## Step 2: Interacting with DOM Elements

- add input elements as properties to class to have access to input values from form
- add event handler functions as class methods for button to get input submission when clicked
- instead of using the .bind() method to set the 'this' context for the event handler, use a method decorator

## Step 3: Fetching User Input

- get input elements values
- add appropriate validation functionality to class

## Step 4: Rendering Project Lists

- implement a new class for `project-list` element
- constructor needs parameter -> will need two different types (`active` | `finished`) that will be instantiated
- same as with `project-input` we copy the HTML template element
- make some changes to the copied element (have dynamic title according to `project type`)
- attach the customized element to the active div

## Step 5: Populating Project List

- get form input data to create a new project object
- this object will be put in the `project-list` active div
- using a state management class for this approach
- implement `Singleton` approach to have one global instance of this state management class (`state manager`)
- this instance can then be used to dynamically add the form inputs as new projects
- the `state manager` stores a global array of the projects added as well as an array of functions (`listeners`) to be called globally
- the `state manager` also has a getter to return all currently saved projects
- the `project-list` class adds the `renderProjects()` function to that global collection of the `state manager` instance (in the constructor!)
- the `renderProjects()` function is maintained by the `project-list` class but with help of the `@Autobind` decorator the context can be passed on
- part of that context is that the projects are loaded in within that scope via calling the project getter function of the `state manager` to get all currently saved projects
- the `state manager` manages the `addProject()` function, that is triggered by form submission (and after input validation) from the `project-input` class
- this `addProject()` also invokes all functions in the global `listeners` collection, which will then call the `renderProjects()` function again of the `project-list` class to re-render the updated projects lists

## Step 6: Filtering Project List

- using a union type to define categories for projects
- the `renderProjects()` function checks for the instance's project type
- if it matches with the status type of the project from the global project's list (from store manager) then it will add the item to it's container

## Step 7: Centralizing some functionalities using a Base Component Class

- add base component class that centralizes HTML rendering and attaching to active container
- add base state management class that centralizes event subscription
- use generic types in base class that can be refined in subclasses

## Step 8: Rendering individual Project Items

- add new class for individual project items that also inherits from base class
- renders project values as HTML content to the target element in active container
- make `renderProjects()` of the `ProjectList` class instantiate the `ProjectItem` class for each new project that is added (added dynamics!)

## Step 9: Implement Drag & Drop

- using interfaces to define the necessary event handlers to be enforced on the respective classes
- implement drag methods
- make sure the HTML element is draggable (attribute)

## Step 10: Update Listeners

- in the State Management class implement new function that updatesListeners
- centralize this functionality so that whenever any other class triggers a change on the HTML elements (e.g. adding a project, or drag-and-dropping it) the listener functions fire and refresh the rendering

# Modularization

Modularization in TypeScript can be achieved using either namespaces or ES modules, each offering distinct advantages and use cases.

## [`Namespaces`](https://github.com/riascho/drag-drop-project-manager/tree/namespaces)

Namespaces in TypeScript are a way to organize code within a single global scope. They are useful for grouping related functionalities and avoiding name collisions. Namespaces are declared using the namespace keyword and can contain classes, interfaces, functions, and variables.

- Suitable for organizing code within a single file or project without external dependencies
- They are less common in modern TypeScript projects.

```typescript
namespace MyNamespace {
  export class MyClass {
    // Class implementation
  }

  export function myFunction() {
    // Function implementation
  }
}
```

## [ES6 Modules](https://github.com/riascho/drag-drop-project-manager/tree/es-modules)

ES modules are the standard for modularization in modern JavaScript and TypeScript. They allow you to split your code into separate files and import/export functionalities as needed. This approach promotes better code organization, reusability, and maintainability.

- Preferred for larger projects and when working with external libraries
- They align with the ECMAScript standard and are supported by modern JavaScript environments.

```typescript
// myModule.ts
export class MyClass {
  // Class implementation
}

export function myFunction() {
  // Function implementation
}

// anotherFile.ts
import { MyClass, myFunction } from "./myModule";

const instance = new MyClass();
myFunction();
```

---

Choosing between namespaces and ES modules depends on the project requirements and the development environment. For most modern TypeScript projects, ES modules are the recommended approach.
