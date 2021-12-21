import Observable from 'zen-observable';

export type EmitApi = PromiseLike<any> & {
  then: {
    emit: (value: (value: any) => void) => EmitApi;
    complete: (value?: (value: any) => void) => EmitApi;
  };
};

declare global {
  namespace Chai {
    interface Assertion {
      emit(value: (value: any) => void): EmitApi;
    }
  }
}

const mochaObservablePlugin: Chai.ChaiPlugin = (chai, utils) => {
  const makeObservableTestApi = (observer: Observable<any>) => {
    const validators: Array<[string, any]> = [];

    const emit = (validate: any) => {
      validators.push([`next`, validate]);
      return api;
    };

    const complete = (validate: any) => {
      validators.push([`complete`, validate]);
      return api;
    };

    const then = (...args: Array<any>) => {
      return new Promise<void>((resolve, reject) => {
        const subscription = observer.subscribe({
          next: checkNext.bind(null, `next`),
          error: checkNext.bind(null, `error`),
          complete: checkNext.bind(null, `complete`),
        });

        function checkNext(type: string, value?: any) {
          const [expectedType, validate] = validators.shift()!;

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
      }).then(...args);
    };

    then.emit = emit;
    then.complete = complete;

    const api = {then};
    return api;
  };

  utils.addMethod(chai.Assertion.prototype, `emit`, function (this: Chai.AssertionPrototype, validate = () => {}) {
    return makeObservableTestApi(this._obj).then.emit(validate);
  });

  utils.addMethod(chai.Assertion.prototype, `complete`, function (this: Chai.AssertionPrototype, validate = () => {}) {
    return makeObservableTestApi(this._obj).then.complete(validate);
  });
};

// eslint-disable-next-line arca/no-default-export
export default mochaObservablePlugin;
