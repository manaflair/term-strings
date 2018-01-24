import { cursor }              from '../core';

import { Cursor }              from './types/Cursor';
import { parseTerminalInputs } from './parseTerminalInputs';

export async function getCursorPosition({ stdin, stdout }) {

    return new Promise((resolve, reject) => {

        let subscription = parseTerminalInputs(stdin).subscribe({

            next: input => {

                if (!(input instanceof Cursor))
                    return;

                if (stdin.setRawMode)
                    stdin.setRawMode(false);

                subscription.unsubscribe();
                resolve(input);

            }

        });

        if (stdin.setRawMode)
            stdin.setRawMode(true);

        stdout.write(cursor.request);

    });

}
