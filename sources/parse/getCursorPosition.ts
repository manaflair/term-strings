import {Readable, Writable}  from 'stream';
import Observable            from 'zen-observable';

import {cursor}              from '../core';

import {parseTerminalInputs} from './parseTerminalInputs';
import {Cursor}              from './types/Cursor';

function streamToObservable(stream: Readable) {
  return new Observable<Buffer>(observer => {
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

export async function getCursorPosition({stdin, stdout}: {stdin: Readable | NodeJS.ReadStream, stdout: Writable}) {
  return new Promise(resolve => {
    const subscription = parseTerminalInputs(streamToObservable(stdin)).subscribe({
      next: input => {
        if (input.type !== `cursor`)
          return;

        if (`setRawMode` in stdin)
          stdin.setRawMode(false);

        subscription.unsubscribe();
        resolve(input);
      },
    });

    if (`setRawMode` in stdin)
      stdin.setRawMode(true);

    stdout.write(cursor.request);
  });
}
