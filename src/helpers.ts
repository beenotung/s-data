export type Child = Node | string | number | boolean | (() => Child);
export type Style = { [key: string]: string };
export type Name = PropertyKey | any;
/**
 * functions inside can be overridden
 * */
export namespace JsonHelpers {
  export function isTimeName(name: Name | undefined): boolean {
    if (typeof name === 'symbol') {
      name = Symbol.keyFor(name);
    }
    if (typeof name === 'string') {
      name = name.toLocaleLowerCase();
      return name.includes('time') || name.includes('date');
    }
    return false;
  }

  export function toStringName(name: Name | undefined): string | undefined {
    if (typeof name === 'symbol') {
      return Symbol.keyFor(name);
    }
    return name;
  }
}

export function appendChild(parent: Node, e: Node | Node[]) {
  if (Array.isArray(e)) {
    e.forEach((e) => appendChild(parent, e));
  } else {
    parent.appendChild(e);
  }
}
