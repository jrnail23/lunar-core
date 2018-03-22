const create = (wm, key, value) => (wm.set(key, value), value);
const get = (wm, key, creator) =>
  wm.has(key) ? wm.get(key) : create(wm, key, creator());

const stores = new WeakMap();

const store = schema => {
  const root = {};

  const track = generator => (...args) => {
    const [obj, arg, context, info] = args;
    const entities = get(stores, schema, () => new WeakMap());
    const childMap = get(entities, obj || root, () => new Map());
    return get(childMap, info.fieldName, () => generator(...args));
  };

  const reset = () => stores.delete(schema);

  return {
    track,
    reset
  };
};

module.exports = { store };
