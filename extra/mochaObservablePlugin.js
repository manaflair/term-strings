export default function mochaObservablePlugin(chai, utils) {

    let makeObservableTestApi = observer => {

        let validators = [];

        let api = { then: (... args) => {

            return new Promise((resolve, reject) => {

                let subscription = observer.subscribe({
                    next: checkNext.bind(this, `next`),
                    error: checkNext.bind(this, `error`),
                    complete: checkNext.bind(this, `complete`),
                });

                function checkNext(type, value) {

                    let [ expectedType, validate ] = validators.shift();

                    try {

                        new chai.Assertion(type).to.equal(expectedType);
                        validate(value);

                        if (validators.length === 0)
                            subscription.unsubscribe();

                        resolve();

                    } catch (error) {

                        subscription.unsubscribe();

                        reject(error);

                    }

                }

            }).then(... args);

        } };

        api.then.emit = validate => {

            validators.push([ `next`, validate ]);

            return api;

        };

        api.then.complete = validate => {

            validators.push([ `complete`, validate ]);

            return api;

        };

        return api;

    };

    utils.addMethod(chai.Assertion.prototype, `emit`, function (validate = () => {}) {

        return makeObservableTestApi(this._obj).then.emit(validate);

    });

    utils.addMethod(chai.Assertion.prototype, `complete`, function (validate = () => {}) {

        return makeObservableTestApi(this._obj).then.complete(validate);

    });

}
