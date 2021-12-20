import { Parser }    from './parser/Parser';
import { Mouse }     from './types/Mouse';
import { sequences } from './sequences';

export function parseTerminalInputs(input, { throttleMouseMoveEvents = 0 } = {}) {

    if (!(`subscribe` in input))
        throw new Error(`Invalid parameter, expected an observable`);

    const Observable = input.constructor;

    return new Observable(observer => {

        let pendingMouseMove = null;
        let throttleTimer = null;

        let send = data => {

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

        let parser = new Parser(send);

        for (let registration of sequences)
            parser.register(... registration);

        let inputSubscription = input.subscribe({

            complete() {

                parser.end();

                setImmediate(() => {
                    observer.complete();
                });

            },

            next(rawData) {

                parser.feed(rawData);

            }

        });

        return () => {

            inputSubscription.unsubscribe();

        };

    });

}
