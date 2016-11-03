#!/usr/bin/env node

import 'core-js';

import { feature }               from '../core';
import { Key, parseInputStream } from '../parse';

process.stdin.setRawMode(true);

process.stdout.write(feature.enableMouseTracking.in);
process.stdout.write(feature.enableMouseHoldTracking.in);
process.stdout.write(feature.enableExtendedCoordinates.in);

process.stdout.write(`Do something, and see how term-strings interpreted your input.\n`);
process.stdout.write(`Press ctrl+c to exit.\n`);

parseInputStream(new Observable(observer => {

    process.stdin.on(`data`, buffer => {
        observer.next(buffer);
    });

    process.stdin.on(`error`, error => {
        observer.error(error);
    });

    process.stdin.on(`close`, () => {
        observer.complete();
    });

})).subscribe({

    next(data) {

        console.log(data);

        if (data instanceof Key && data.name === `c` && data.ctrl) {
            process.exit();
        }

    }

});

process.on(`exit`, () => {

    process.stdin.setRawMode(false);

    process.stdout.write(feature.enableExtendedCoordinates.out);
    process.stdout.write(feature.enableMouseHoldTracking.out);
    process.stdout.write(feature.enableMouseTracking.out);

});
