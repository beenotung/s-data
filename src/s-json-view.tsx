import * as Surplus from 'surplus';Surplus;
export type JsonViewProps<T> = {
  data: T,
  name?: string
  expandElement?: boolean
};
export namespace JsonRenders {
  export function isTimeName(name: string) {
    return name.includes('time') || name.includes('date');
  }

  export function name(name: PropertyKey | undefined): string {
    return (name || '').toString().toLocaleLowerCase();
  }

  export function date(data: Date) {
    return string(data.toLocaleString());
  }

  export function number(data: number) {
    return string(data.toLocaleString());
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
        <td>=></td>
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
        <td>{string(key)}:</td>
        <td>{value as HTMLElement}</td>
      </tr>)}
      </tbody>
    </table>;
  }

  export function object(props: JsonViewProps<object>) {
    return <table>
      <tbody>
      {Object.entries(props.data).map(([key, value]) => <tr>
        <td>{string(key)}:</td>
        <td><JsonView {...props} data={value} name={key}/></td>
      </tr>)}
      </tbody>
    </table>;
  }

  export function string(data: string) {
    return <span>{data}</span>;
  }

  export function text(data: Text) {
    return table({
      textContent:
        data.textContent === null ? Null() :
          string(data.textContent),
    });
  }

  export function attributes(attrs: NamedNodeMap): object {
    let res = {} as any;
    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs.item(i);
      if (attr === null) {
        continue;
      }
      res[attr.name] = attr.value;
    }
    return res;
  }

  export function htmlElement(data: HTMLElement) {
    let input = data as HTMLInputElement;
    let res = {
      tagName: data.tagName.toLocaleLowerCase(),
      id: data.id,
      className: data.className,
      attributes: data.attributes.length > 0 ? attributes(data.attributes) : void 0,
      nodeValue: data.nodeValue,
      value: input.value,
    };
    Object.keys(res).forEach((_key) => {
      const key = _key as keyof typeof res;
      let value = res[key];
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

  export function bigint(data: bigint) {
    return string(data.toLocaleString());
  }

  export function boolean(data: boolean) {
    return string(data ? 'yes' : 'no');
  }

  export function Function(data: Function) {
    return string(data.toString());
  }

  export function symbol(data: symbol) {
    return string(data.toString());
  }

  export function Null() {
    return string('null');
  }

  export function undefined() {
    return string('undefined');
  }

  export function unknown(data: unknown) {
    return string(Object.prototype.toString.call(data));
  }
}
let r = JsonRenders;

export function JsonView(props: JsonViewProps<any>): HTMLElement {
  const data = props.data;
  const name = r.name(props.name);
  const type = typeof data;
  switch (type) {
    case 'string':
      return data;
    case 'number':
      if (r.isTimeName(name)) {
        return r.date(new Date(data));
      } else {
        return r.number(data);
      }
    case 'bigint':
      return r.bigint(data);
    case 'boolean':
      return r.boolean(data);
    case 'function':
      return r.Function(data);
    case 'symbol':
      return r.symbol(data);
    case 'undefined':
      return r.undefined();
    case 'object':
      if (data === null) {
        return r.Null();
      }
      if (data instanceof Date) {
        return r.date(data);
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
          return r.text(data);
        }
        if (data instanceof HTMLElement) {
          return r.htmlElement(data);
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
      return r.unknown(data);
    }
  }
}
