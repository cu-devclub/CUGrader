import { reaction } from "mobx";
import { fromResource, type IResource } from "mobx-utils";
import { Observable, type Subscription } from "rxjs";

export function toObservable<T>(expression: () => T) {
  return new Observable<T>((sub) => {
    const cleanup = reaction(expression, (value) => {
      sub.next(value);
    });

    return cleanup;
  });
}

export function toSignal<T>(observable: Observable<T>): IResource<T | undefined>;
export function toSignal<T>(observable: Observable<T>, initialValue: T): IResource<T>;
export function toSignal<T>(observable: Observable<T>, initialValue?: T) {
  let subscription: Subscription;
  return fromResource(
    sink => {
      subscription = observable.subscribe(value => {
        sink(value);
      });
    },
    () => subscription.unsubscribe(),
    initialValue
  );
}