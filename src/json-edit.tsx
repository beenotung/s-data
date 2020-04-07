import S from 's-js';
import * as Surplus from 'surplus';
import { JsonHelpers, Name } from './helpers';
import { JsonViewRenders } from './json-view';

// tslint:disable-next-line no-unused-expression
Surplus;

export type UpdateDetail = {
  parent?: object
  name?: string
  oldValue: any
  newValue: any,
};
export type JsonEditProps<T> = {
  data: T,
  name?: string
  parent?: object
  updateValue?: (value: T) => void
  onChange?: (ev: Event, detail: UpdateDetail) => void
  editElement?: boolean,
};

export type PrecisionType =
  | 'minutes'
  | 'seconds'
  | 'milliseconds'
  ;

/**
 * functions inside can be overridden
 * */
export namespace JsonEditRenders {
  export let precision: PrecisionType = 'minutes';

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
    const oldValue = props.data;
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

  // tslint:disable-next-line ban-types
  export function Function(props: JsonEditProps<Function>) {
    return <textarea
      name={JsonHelpers.toStringName(props.name)}
      value={props.data.toString()}
      // tslint:disable-next-line no-eval
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

  function d2(x: number): string {
    if (x < 10) {
      return '0' + x;
    }
    return x.toString();
  }

  function d3(x: number): string {
    if (x < 10) {
      return '0' + x;
    }
    if (x < 100) {
      return '00' + x;
    }
    return x.toString();
  }

  // input[type=date].value string format in local timezone
  export function dateString(date: Date): string {
    return `${date.getFullYear()}-${d2(date.getMonth() + 1)}-${d2(date.getDate())}`;
  }

  // input[type=time].value string format in local timezone
  export function timeString(date: Date): string {
    let timeStr = `${d2(date.getHours())}:${d2(date.getMinutes())}`;
    switch (precision) {
      case 'seconds':
      case 'milliseconds':
        timeStr += ':' + d2(date.getSeconds());
        if (precision === 'milliseconds') {
          timeStr += '.' + d3(date.getMilliseconds());
        }
    }
    return timeStr;
  }

  export function date(props: JsonEditProps<number | Date>) {
    // TODO
    let date = new Date(props.data);
    const dateStr = dateString(date);
    const timeStr = timeString(date);
    return [
      <input
        name={JsonHelpers.toStringName(props.name)}
        type='date'
        value={dateStr}
        onChange={ev => {
          const value = (ev.target as HTMLInputElement).value;
          if (value) {
            date = new Date(value + ' ' + timeStr);
          } else {
            // not date but still has time
            const input = document.createElement('input');
            input.type = 'time';
            input.value = timeStr;
            date = input.valueAsDate!;
          }
          if (props.data instanceof Date) {
            update(ev, props, date);
          } else {
            update(ev, props, date.getTime());
          }
        }}
      />,
      <input
        name={JsonHelpers.toStringName(props.name)}
        type='time'
        value={timeStr}
        onChange={ev => {
          const value = (ev.target as HTMLInputElement).value;
          if (value) {
            date = new Date(dateStr + ' ' + value);
          } else {
            // update time but still has date
            date = new Date(dateStr);
          }
          if (props.data instanceof Date) {
            update(ev, props, date);
          } else {
            update(ev, props, date.getTime());
          }
        }}
      />,
    ];
  }

  export function set(props: JsonEditProps<Set<any>>) {
    const signals = Array.from(props.data).map(x => S.data(x));
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
    const signals = Array.from(props.data.entries()).map(x => S.data(x));
    return <table>
      <tbody>
      {signals.map((kvSignal) => {
        return <tr>
          <td>{JsonEdit({
            ...props,
            parent: props.data,
            data: S.sample(kvSignal)[0],
            updateValue: newKey => {
              const [key, value] = kvSignal();
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
              const [key] = kvSignal();
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
    updateValue: (value: string) => void,
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
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    const attrs = props.data.attributes;
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
            const value = attr.value;
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
    table.appendChild(tbody);
    return table;
  }

  export function htmlElement(props: JsonEditProps<HTMLElement>) {
    const e = props.data as HTMLInputElement;
    const children: Array<HTMLElement | HTMLElement[]> = [];
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
    const signals = Object.entries(props.data).map(x => S.data(x));
    return <table>
      <tbody>{signals.map((kvSignal) => {
        return <tr>
          <td>{string({
            ...props,
            parent: props.data,
            data: S.sample(kvSignal)[0],
            updateValue: newKey => {
              const [key, value] = kvSignal();
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
const r = JsonEditRenders;

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
