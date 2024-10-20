# App Documentation

Some notes on the structure and design decisions taken for this project.

## 1. Types

### ProjectStatus

Is a Union Type. Decided not to use enum because there's no functionality for the 0 or 1 values.

### ListenerFunctionWithoutArguments

Used for functions passed to the listeners collection in the state manager to be called by the state manager in an event. Could also use type `(items: Project[]) => void` when we need to be more restrictive to make sure these functions always contain parameters

## 2. Interfaces

Using interfaces when we want to add specific types and structures to certain classes or objects to implement certain methods.

### Draggable

Interface for classes that implement drag functionality (e.g. ProjectItem class)

- `dragStartHandler(event: DragEvent)` - when item becomes draggable
- `dragEndHandler(event: DragEvent)` - when item stops to be draggable

### DragTarget

Interface for classes that implement drop target functionality (e.g. ProjectList class)

- `dragOverHandler(event: DragEvent)` - permit the drop
- `dropHandler(event: DragEvent)` - handle the drop
- `dragLeaveHandler(event: DragEvent)` - visual feedback after drop or abort

## 3. Methods / Functions

### Autobind Decorator

Use as decorator function to bind methods to their class instance instead of the classic callback assignment to the event target for example.

- `\_target` - prototype of class, e.g. ProjectInput
- `\_methodName` - e.g. 'activateSubmitButton'
- `descriptor` - PropertyDescriptor

### validate

This function performs a variety of validation checks on input.
It uses a variable `isValid` that is always true unless the following validation checks turn it `false`. It is returned at the end and therefore, if any one check fails, the whole input validation failed.

## 4. Classes

### StateManagement

Manages shared functions across classes.

- `protected listeners: ListenerFunctionWithoutArguments[] = [];` (same as: `private listeners: (() => void)[] = [];`)
  This is a public method, that lets other classes add their functions to the listeners collection so that they can be shared across different classes
- `protected updateListeners()` - this function calls all callback functions in the listener collection. This can trigger dynamic re-rendering after an event

### ProjectStateManagement

This is a `Singleton` class for managing project state. This class can only be instantiated once (as global object to be used throughout the app). This is achieved via the `private constructor`.
The `addProject` method is public so it can be called from outside of class to add new projects. Projects will be added to `active` session by default.

### Base Component

This is an `abstract` class because we only need this class for inheritance and it shall not be instantiated.
`abstract` methods are for inheritance only. The implementation is up to the subclass but they are forced to at least have these methods.

The Component class uses generic types to allow for different types but have a common ground.

We do an existence check on the template id.

```typescript
const templateElement = document.getElementById(templateId);
if (templateElement) {
  this.templateElement = templateElement as HTMLTemplateElement;
}
```

This could also be written with a `!` operator at the end, to tell TypeScript, that this id will always exist.

```typescript
const templateElement = document.getElementById(templateId)!;
```

`attachActiveElements(position)` adds the grabbed template element to the active div element

### ProjectInput

The `activate()` method attaches the `submitHandler` function when the form is submitted (on `submit` event).

**Common Problem:**
The `this` context within a callback will be bound to the target of the event (not the class)!.
The `.bind()` method can be used to bind the `this` context to the appropriate class. However, this can be achieved with a method decorator (`Autobind`) as well.

```typescript
this.formElement.addEventListener("submit", this.submitHandler.bind(this)); // binding 'this' context to the class
```

- `event.preventDefault()` removes default behavior (e.g. to send HTTP request upon submission). This is used to implement custom behavior (e.g. what to do when form is submitted).

- `submitHandler` function checks if input is a tuple (via `Array.isArray()` because a tuple is essentially an array). If true, we got a valid input tuple.

### ProjectList

The `activate()` method registers the `renderProjects` function to the state manager, so it can be called from elsewhere.

The `renderContent()` method fills in the template element tags in the active element.

For the `renderProjects` method, the `@Autobind` decorator is applied to ensure it retains the correct '.this' context when called (e.g. from the state manager instance)

### ProjectItem

Implements the `Draggable` class, so that the we're forced to implement the `Draggable` methods.

The types `HTMLUListElement` (from `T` in base class) corresponds to the element where our project items will be placed in and `HTMLLIElement` (from `U` in the base class) is the item we want to place in `T`.

## 5. Global Instances

`stateManager` is a global instance (`Singleton`) that can be used to interact between classes

When these classes are instantiated the rendering is executed and will show up in browser:

```typescript
new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
```

# To-Do's:

- Improve validation function so that an alert is shown for the specific validation check that failed.
- Use Decorators for validation checks.
- Connect database to store projects (in `stateManager.storedProjects` via `stateManager.addProject()`) -> will be rendered with `ProjectList.renderProjects()`.
- When rendering project list, it would be better for performance to not fetch the whole list every time, but only append new items.
