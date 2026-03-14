const MIN_MS = 200;
const MAX_MS = 1500;

const randomDelayMs = (): number => {
  return Math.floor(MIN_MS + Math.random() * (MAX_MS - MIN_MS + 1));
};

const withDelay = <T>(fn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const ms = randomDelayMs();
    setTimeout(() => {
      fn().then(resolve).catch(reject);
    }, ms);
  });
};

export {withDelay};
