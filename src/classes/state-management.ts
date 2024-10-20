type ListenerFunctionWithoutArguments = () => void;

export class StateManagement {
  protected listeners: ListenerFunctionWithoutArguments[] = [];
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
