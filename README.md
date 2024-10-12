# Drag & Drop Project Manager

This is TypeScript project of an app that let's you manage projects by drag-and-drop.

From the course [Boost your JavaScript projects with TypeScript](https://www.udemy.com/course/understanding-typescript/)

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
