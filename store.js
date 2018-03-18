const root = {};
const stores = new WeakMap();

const create = (wm, key, value) => (wm.set(key, value), value);
const get = (wm, key, creator) =>
  wm.has(key) ? wm.get(key) : create(wm, key, creator());

const store = schema => generator => (obj, _args, _context, info) => {
  const owner = obj || root;

  const entities = get(stores, schema, () => new WeakMap());

  const childMap = get(entities, owner, () => new Map());

  return get(childMap, info.fieldName, () =>
    generator(obj, _args, _context, info)
  );
};

module.exports = { store };
