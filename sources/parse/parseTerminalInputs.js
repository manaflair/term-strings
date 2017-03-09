import { Parser }    from './parser/Parser';
import { Mouse }     from './types/Mouse';
import { sequences } from './sequences';

function streamToObservable(stream) {

    return new Observable(observer => {

        stream.on(`data`, data => {
            observer.next(data);
        });

        stream.on(`error`, error => {
            observer.error(error);
        });

        stream.on(`end`, () => {
            observer.complete();
        });

    });

}

export function parseTerminalInputs(input, { throttleMouseMoveEvents = 0 } = {}) {

    if (!(`subscribe` in input) && `read` in input)
        input = streamToObservable(input);

    if (!(`subscribe` in input))
        throw new Error(`Invalid parameter, expected a readable tream or an observable`);

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
