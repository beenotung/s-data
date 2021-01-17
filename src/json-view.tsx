import * as Surplus from 'surplus';
import { JsonHelpers } from './helpers';

// tslint:disable-next-line no-unused-expression
Surplus;

export type JsonViewProps<T> = {
  data: T,
  name?: string
  expandElement?: boolean,
};

/**
 * functions inside can be overridden
 * */
export namespace JsonViewRenders {
  export function date(props: JsonViewProps<Date>) {
    return string({ ...props, data: props.data.toLocaleString() });
  }

  export function number(props: JsonViewProps<number>) {
    return string({ ...props, data: props.data.toLocaleString() });
  }

  export function set(prop: JsonViewProps<Set<any>>) {
    return <ul>
      {Array.from(prop.data).map(x => <li>
        <JsonView {...prop} data={x}/>
      </li>)}
    </ul>;
  }

  export function map(props: JsonViewProps<Map<any, any>>) {
    return <table>
      <tbody>
      {Array.from(props.data.entries()).map(([key, value]) => <tr>
        <td><JsonView {...props} data={key}/></td>
        <td>{'=>'}</td>
        <td><JsonView {...props} data={value} name={key}/></td>
      </tr>)}
      </tbody>
    </table>;
  }

  export function array(props: JsonViewProps<any[]>) {
    return <ol>
      {props.data.map(x => <li>
        <JsonView {...props} data={x}/>
      </li>)}
    </ol>;
  }

  export function table(data: Record<string, HTMLElement | Text>) {
    return <table>
      <tbody>
      {Object.entries(data).map(([key, value]) => <tr>
        <td>{string({ data: key })}:</td>
        <td>{value as HTMLElement}</td>
      </tr>)}
      </tbody>
    </table>;
  }

  export function object(props: JsonViewProps<object>) {
    return <table>
      <tbody>
      {Object.entries(props.data).map(([key, value]) => <tr>
        <td>{string({ ...props, data: key })}:</td>
        <td><JsonView {...props} data={value} name={key}/></td>
      </tr>)}
      </tbody>
    </table>;
  }

  export function string(props: JsonViewProps<string>) {
    return <span>{props.data}</span>;
  }

  export function text(props: JsonViewProps<Text>) {
    const textContent = props.data.textContent;
    return table({
      textContent:
        textContent === null ? Null(props) :
          string({ ...props, data: textContent }),
    });
  }

  export function attributes(attrs: NamedNodeMap): object {
    const res = {} as any;
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs.item(i);
      if (attr === null) {
        continue;
      }
      res[attr.name] = attr.value;
    }
    return res;
  }

  export function htmlElement(props: JsonViewProps<HTMLElement>) {
    const e = props.data as HTMLInputElement;
    const res = {
      tagName: e.tagName.toLocaleLowerCase(),
      id: e.id,
      className: e.className,
      attributes: e.attributes.length > 0 ? attributes(e.attributes) : void 0,
      nodeValue: e.nodeValue,
      value: e.value,
    };
    Object.keys(res).forEach((_key) => {
      const key = _key as keyof typeof res;
      const value = res[key];
      switch (value) {
        case '':
        case null:
        case void 0:
          delete res[key];
          break;
        default:
          if (Array.isArray(value) && value.length === 0) {
            delete res[key];
          }
      }
    });
    return object({ data: res });
  }

  export function bigint(props: JsonViewProps<bigint>) {
    return string({ ...props, data: props.data.toLocaleString() });
  }

  export function boolean(props: JsonViewProps<boolean>) {
    return string({ ...props, data: props.data ? 'yes' : 'no' });
  }

  // tslint:disable-next-line ban-types
  export function Function(props: JsonViewProps<Function>) {
    return string({ ...props, data: props.data.toString() });
  }

  export function symbol(props: JsonViewProps<symbol>) {
    return string({ ...props, data: props.data.toString() });
  }

  export function Null(props: JsonViewProps<any>) {
    return string({ ...props, data: 'null' });
  }

  export function undefined(props: JsonViewProps<undefined>) {
    return string({ ...props, data: 'undefined' });
  }

  export function unknown(props: JsonViewProps<unknown>) {
    return string({ ...props, data: Object.prototype.toString.call(props.data) });
  }
}
const r = JsonViewRenders;

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
export function JsonView(props: JsonViewProps<any>): HTMLElement {
  const data: unknown = props.data;
  const type = typeof data;
  switch (type) {
    case 'string':
      return r.string(props);
    case 'number':
      if (JsonHelpers.isTimeName(props.name)) {
        return r.date({ ...props, data: new Date(data as number) });
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
      if (props.expandElement) {
        if (data instanceof Text) {
          return r.text(props);
        }
        if (data instanceof HTMLElement) {
          return r.htmlElement(props);
        }
      }
      if (data instanceof Text) {
        return data as any;
      }
      if (data instanceof HTMLElement) {
        return data;
      }
      return r.object(props);
    default: {
      const x: never = type;
      console.error('unknown data type:', x);
      return r.unknown(props);
    }
  }
}
