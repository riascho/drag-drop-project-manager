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
