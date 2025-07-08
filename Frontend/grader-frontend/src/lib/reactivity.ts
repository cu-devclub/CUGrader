import { reaction } from "mobx";
import { Observable } from "rxjs";

export function toObservable<T>(expression: () => T) {
  return new Observable<T>((sub) => {
    const cleanup = reaction(expression, (value) => {
      sub.next(value);
    });

    return cleanup;
  });
}
