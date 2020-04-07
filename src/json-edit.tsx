import * as Surplus from 'surplus';
import { JsonHelpers, Name } from './helpers';
import { JsonViewRenders } from './json-view';
import SArray from 's-array';
import S from 's-js';

Surplus;

export type UpdateDetail = {
  parent?: object
  name?: string
  oldValue: any
  newValue: any
}
export type JsonEditProps<T> = {
  data: T,
  name?: string
  parent?: object
  updateValue?: (value: T) => void
  onChange?: (ev: Event, detail: UpdateDetail) => void
  editElement: boolean
};

/**
 * functions inside can be overridden
 * */
export namespace JsonEditRenders {

  function updateValue(props: JsonEditProps<any>, newValue: any) {
    if (props.updateValue) {
      props.updateValue(newValue);
      return;
    }
    if (!props.parent) {
      console.warn('missing parent');
      props.data = newValue;
      return;
    }
    if (props.name === void 0) {
      console.warn('missing name');
      props.data = newValue;
      return;
    }
    (props.parent as any)[props.name] = newValue;
  }

  function update(ev: Event, props: JsonEditProps<any>, newValue: any) {
    let oldValue = props.data;
    updateValue(props, newValue);
    if (props.onChange) {
      props.onChange(ev, {
        parent: props.parent,
        name: props.name,
        oldValue,
        newValue,
      });
    }
  }

  export function string(props: JsonEditProps<string>) {
    return <input
      name={JsonHelpers.toStringName(props.name)}
      type='text'
      value={props.data}
      onChange={ev => update(ev, props, (ev.target as HTMLInputElement).value)
      }
    />;
  }

  export function number(props: JsonEditProps<number>) {
    return <input
      name={JsonHelpers.toStringName(props.name)}
      type='number'
      value={props.data}
      onChange={ev => update(ev, props, (ev.target as HTMLInputElement).valueAsNumber)}
    />;
  }

  export function bigint(props: JsonEditProps<bigint>) {
    return <input
      name={JsonHelpers.toStringName(props.name)}
      type='text'
      value={props.data.toString()}
      onChange={ev => update(ev, props, BigInt((ev.target as HTMLInputElement).value))}
    />;
  }

  export function boolean(props: JsonEditProps<boolean>) {
    return <input
      name={JsonHelpers.toStringName(props.name)}
      type='checkbox'
      checked={props.data}
      onChange={ev => update(ev, props, (ev.target as HTMLInputElement).checked)}
    />;
  }

  export function Function(props: JsonEditProps<Function>) {
    return <textarea
      name={JsonHelpers.toStringName(props.name)}
      value={props.data.toString()}
      onChange={ev => update(ev, props, eval((ev.target as HTMLTextAreaElement).value))}
    />;
  }

  export function symbol(props: JsonEditProps<symbol>) {
    return [
      <label>Symbol:</label>,
      <input
        name={JsonHelpers.toStringName(props.name)}
        type='text'
        value={Symbol.keyFor(props.data)}
        onChange={ev => update(ev, props, Symbol.for((ev.target as HTMLInputElement).value))}
      />,
    ];
  }

  export function undefined(props: JsonEditProps<undefined>) {
    // TODO infer type for undefined?
    return JsonViewRenders.undefined(props);
  }

  export function Null(props: JsonEditProps<undefined>) {
    // TODO infer type for null?
    return JsonViewRenders.Null(props);
  }

  export function date(props: JsonEditProps<number | Date>) {
    const date = new Date(props.data);
    // TODO
    return JsonViewRenders.date({ ...props, data: date });
  }

  export function set(props: JsonEditProps<Set<any>>) {
    let signals = Array.from(props.data).map(x => S.data(x));
    return <ul>{signals.map((signal) => <li>{JsonEdit({
      ...props,
      parent: props.data,
      data: S.sample(signal),
      updateValue: newValue => {
        props.data.delete(signal());
        props.data.add(newValue);
        signal(newValue);
      },
    })}</li>)}</ul>;
  }

  export function map(props: JsonEditProps<Map<any, any>>) {
    let signals = Array.from(props.data.entries()).map(x => S.data(x));
    return <table>
      <tbody>
      {signals.map((kvSignal) => {
        return <tr>
          <td>{JsonEdit({
            ...props,
            parent: props.data,
            data: S.sample(kvSignal)[0],
            updateValue: newKey => {
              let [key, value] = kvSignal();
              props.data.delete(key);
              props.data.set(newKey, value);
              kvSignal([newKey, value]);
            },
          })}</td>
          <td>=></td>
          <td>{JsonEdit({
            ...props,
            parent: props.data,
            name: kvSignal()[0],
            data: kvSignal()[1],
            updateValue: newValue => {
              let [key] = kvSignal();
              props.data.set(key, newValue);
              kvSignal([key, newValue]);
            },
          })}</td>
        </tr>;
      })}
      </tbody>
    </table>;
  }

  export function array(props: JsonEditProps<any[]>) {
    return <ol>{props.data.map((x, i) => <li>{JsonEdit({
      ...props,
      parent: props.data,
      data: x,
    })}</li>)}</ol>;
  }

  function asString(props: JsonEditProps<any>, options: {
    name: Name | undefined,
    data: string,
    updateValue: (value: string) => void
  }) {
    return string({
      ...props,
      ...options,
    });
  }

  export function text(props: JsonEditProps<Text>) {
    return JsonViewRenders.table({
      textContent: asString(props, {
        name: 'textContent',
        data: props.data.textContent || '',
        updateValue: value => props.data.textContent = value,
      }),
    });
  }


  export function attributes(props: JsonEditProps<HTMLElement>): HTMLElement {
    let tbody!: HTMLTableSectionElement;
    let table = <table>
      <tbody ref={tbody}></tbody>
    </table>;
    let attrs = props.data.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs.item(i);
      if (attr === null) {
        continue;
      }
      tbody.appendChild(<tr>
        <td>{string({
          ...props,
          parent: attr,
          name: 'attributes',
          data: attr.name,
          updateValue: newName => {
            let value = attr.value;
            attrs.removeNamedItem(attr.name);
            props.data.setAttribute(newName, value);
          },
        })}</td>
        <td>:</td>
        <td>{string({
          ...props,
          parent: attr,
          name: attr.name,
          data: attr.value,
          updateValue: newValue => {
            props.data.setAttribute(attr.name, newValue);
          },
        })}</td>
      </tr>);
    }
    return table;
  }

  export function htmlElement(props: JsonEditProps<HTMLElement>) {
    // TODO
    let e = props.data as HTMLInputElement;
    let children: Array<HTMLElement | HTMLElement[]> = [];
    e.childNodes.forEach(child => children.push(JsonEdit({ ...props, data: child })));
    return JsonViewRenders.table({
      tagName: JsonViewRenders.string({ name: 'tagName', data: e.tagName }),
      id: asString(props, { name: 'id', data: e.id, updateValue: value => props.data.id = value }),
      className: asString(props, { name: 'className', data: e.className, updateValue: value => props.data.className = value }),
      attributes: attributes(props),
      nodeValue: asString(props, { name: 'nodeValue', data: e.nodeValue || '', updateValue: value => props.data.nodeValue = value }),
      value: JsonEdit({
        ...props,
        name: 'value',
        data: e.value,
        updateValue: value => (props.data as HTMLInputElement).value = value,
      }) as HTMLElement,
      childNodes: array({
        ...props,
        editElement: false,
        name: 'childNodes',
        data: children,
        updateValue: value => {
          console.log('update childNodes', value);
        },
      }),
    });
  }

  export function object(props: JsonEditProps<object>) {
    let signals = Object.entries(props.data).map(x => S.data(x));
    return <table>
      <tbody>{signals.map((kvSignal) => {
        return <tr>
          <td>{string({
            ...props,
            parent: props.data,
            data: S.sample(kvSignal)[0],
            updateValue: newKey => {
              let [key, value] = kvSignal();
              delete (props.data as any)[key];
              (props.data as any)[newKey] = value;
              kvSignal([newKey, value]);
            },
          })}</td>
          <td>:</td>
          <td>{JsonEdit({
            ...props,
            parent: props.data,
            name: kvSignal()[0],
            data: kvSignal()[1],
          })}</td>
        </tr>;
      })}</tbody>
    </table>;
  }

  export function unknown(props: JsonEditProps<unknown>) {
    // TODO infer type for unknown?
    return JsonViewRenders.unknown(props);
  }
}
let r = JsonEditRenders;

/**
 * supported data type:
 *   + HTMLElement
 *   + Text (DOM node)
 *   + string
 *   + number
 *   + timestamp (in number)
 *   + Date
 *   + bigint
 *   + boolean
 *   + function (show the source code)
 *   + symbol
 *   + undefined
 *   + null
 *   + Set
 *   + Map
 *   + Array
 *   + object
 * */
export function JsonEdit(props: JsonEditProps<any>): HTMLElement | HTMLElement[] {
  const data: unknown = props.data;
  const type = typeof data;
  switch (type) {
    case 'string':
      return r.string(props);
    case 'number':
      if (JsonHelpers.isTimeName(props.name)) {
        return r.date(props);
      } else {
        return r.number(props);
      }
    case 'bigint':
      return r.bigint(props);
    case 'boolean':
      return r.boolean(props);
    case 'function':
      return r.Function(props);
    case 'symbol':
      return r.symbol(props);
    case 'undefined':
      return r.undefined(props);
    case 'object':
      if (data === null) {
        return r.Null(props);
      }
      if (data instanceof Date) {
        return r.date(props);
      }
      if (data instanceof Set) {
        return r.set(props);
      }
      if (data instanceof Map) {
        return r.map(props);
      }
      if (Array.isArray(data)) {
        return r.array(props);
      }
      if (props.editElement) {
        if (data instanceof Text) {
          return r.text(props);
        }
        if (data instanceof HTMLElement) {
          return r.htmlElement(props);
        }
      }
      if (data instanceof Text) {
        return props.data;
      }
      if (data instanceof HTMLElement) {
        return props.data;
      }
      return r.object(props);
    default: {
      const x: never = type;
      console.error('unknown data type:', x);
      return r.unknown(props);
    }
  }
}
