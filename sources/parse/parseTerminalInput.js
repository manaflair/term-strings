import { sequenceTree } from './sequenceTree';

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

export function parseTerminalInput(input) {

    if (!(`subscribe` in input) && `read` in input)
        input = streamToObservable(input);

    if (!(`subscribe` in input))
        throw new Error(`Invalid parameter, expected a readable tream or an observable`);

    return new Observable(observer => {

        let inputIsComplete = false;

        let currentNode = sequenceTree;

        let currentSequence = [];
        let currentOutput = null;

        let currentPath = [];
        let currentData = [];

        let inputSubscription = input.subscribe({

            complete() {

                // We mark our parent observer as being complete so that we don't expect any more data from it
                inputIsComplete = true;

                // If we've seen a registered sequence, we need to trigger it
                if (currentOutput !== null) {

                    // We emit the last key seen
                    observer.next(currentOutput(currentSequence));
                    currentNode = sequenceTree;
                    currentSequence = [];
                    currentOutput = null;

                    // We now start a final cycle to emit remaining keys
                    this.next(currentSequence);

                // If no sequence has been found, we can just emit our buffered data
                } else if (currentData.length > 0) {

                    observer.next(new Buffer(currentData));

                }

                // Whatever happens, we've now done everything we could
                observer.complete();

            },

            next(rawData) {

                let pendingData = Array.from(rawData);

                while (pendingData.length > 0) {

                    while (pendingData.length > 0) {

                        let byte = pendingData.shift();
                        let sub = currentNode.sub.get(byte);

                        // If the byte doesn't link to a key somewhere down the tree
                        if (!sub) {

                            // If we've seen a registered sequence, we need to trigger it before starting to buffer data again
                            if (currentOutput !== null) {

                                // We emit the last key seen
                                observer.next(currentOutput(currentSequence));
                                currentNode = sequenceTree;
                                currentSequence = [];
                                currentOutput = null;

                                // Then we push back the extra sequence at the beginning of our data (they can be used to start a new sequence from the beginning)
                                currentPath.push(byte);
                                pendingData = currentPath.concat(pendingData);

                            } else {

                                // Buffer the byte
                                currentData.push(byte);

                            }

                        } else {

                            // If there's no possible subpaths, we just send the key now
                            if (sub.sub.size === 0) {

                                // If there was some data before the key, we need to emit them first
                                if (currentData.length > 0) {
                                    observer.next(new Buffer(currentData));
                                    currentData = [];
                                }

                                // Prepare our global state
                                currentSequence = currentSequence.concat(currentPath, [ byte ]);
                                currentOutput = sub.output;

                                // We can the emit the key
                                observer.next(currentOutput(currentSequence));
                                currentNode = sequenceTree;
                                currentSequence = [];
                                currentOutput = null;

                                // We can clear the current sequence
                                currentPath = [];

                            } else {

                                currentNode = sub;
                                currentPath.push(byte);

                                if (currentNode.output !== null) {
                                    currentSequence = currentSequence.concat(currentPath);
                                    currentOutput = currentNode.output;
                                    currentPath = [];
                                }

                            }

                        }

                    }

                    // If we know we won't receive any more data, we can send the current sequence
                    if (inputIsComplete && currentOutput !== null) {
                        observer.next();
                        pendingData = currentSequence;
                        currentSequence = [];
                        currentOutput = null;
                    }

                }

                // If we're not following a possible sequence, we can emit the buffered data
                if (currentNode === sequenceTree && currentData.length > 0) {
                    observer.next(new Buffer(currentData));
                    currentData = [];
                }

            }

        });

        return () => {

            inputSubscription.unsubscribe();

        };

    });

}
