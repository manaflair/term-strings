import Observable           from 'zen-observable';

import {Parser, Production} from './parser/Parser';
import {sequences}          from './sequences';
import {Cursor}             from './types/Cursor';
import {Key}                from './types/Key';
import {Mouse}              from './types/Mouse';

export function parseTerminalInputs(input: Observable<Array<number> | Uint8Array>, {throttleMouseMoveEvents = 0} = {}) {
  return new Observable<Production>((observer: any) => {
    let pendingMouseMove: Mouse | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;

    const send = (data: Production) => {
      if (throttleMouseMoveEvents > 0 && data instanceof Mouse && !data.start && !data.end) {
        pendingMouseMove = data;

        if (!throttleTimer) {
          throttleTimer = setTimeout(() => {
            observer.next(pendingMouseMove);

            pendingMouseMove = null;
            throttleTimer = null;
          }, throttleMouseMoveEvents);
        }
      } else {
        if (throttleTimer) {
          clearTimeout(throttleTimer);
          throttleTimer = null;
        }

        if (pendingMouseMove) {
          observer.next(pendingMouseMove);
          pendingMouseMove = null;
        }

        observer.next(data);
      }
    };

    const parser = new Parser(send);

    for (const registration of sequences)
      parser.register(...registration);

    const inputSubscription = input.subscribe({
      complete() {
        parser.end();

        setImmediate(() => {
          observer.complete();
        });
      },

      next(rawData) {
        parser.feed(rawData);
      },
    });

    return () => {
      inputSubscription.unsubscribe();
    };
  });
}
