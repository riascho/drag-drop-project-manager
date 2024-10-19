// using interfaces when we want to add specific types and structures to certain classes or objects to implement certain methods

namespace App {
  export interface Draggable {
    // e.g. ProjectItem class
    dragStartHandler(event: DragEvent): void; // when it becomes draggable
    dragEndHandler(event: DragEvent): void; // when it stops to be draggable
  }

  export interface DragTarget {
    // e.g. ProjectList class
    dragOverHandler(event: DragEvent): void; // permit the drop
    dropHandler(event: DragEvent): void; // handle the drop
    dragLeaveHandler(event: DragEvent): void; // visual feedback after drop or abort
  }
}
