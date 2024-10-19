namespace App {
  // Autobind Decorator

  export function Autobind(
    _target: any, // 'prototype of class (ProjectInput)'
    _methodName: string, // 'activateSubmitButton'
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value; // this addresses the element value the eventhandler is executed on
    const newDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        return originalMethod.bind(this);
      },
    };
    return newDescriptor;
  }
}
