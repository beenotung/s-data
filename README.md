# s-json
General purpose JSON viewer and editor

[![npm Package Version](https://img.shields.io/npm/v/@beenotung/s-json.svg?maxAge=2592000)](https://www.npmjs.com/package/@beenotung/s-json)

Powered by
[S.js](https://github.com/adamhaile/S)
and
[surplus](https://github.com/adamhaile/surplus)

Demo: https://s-json-demo.surge.sh/

## Installation
```bash
npm install @beenotung/s-json
```

## Typescript Signature
```typescript
declare function JsonView(props: JsonViewProps<any>): HTMLElement

declare function JsonEdit(props: JsonEditProps<any>): HTMLElement | HTMLElement[]

type JsonViewProps<T> = {
  data: T,
  name?: string
  expandElement?: boolean,
}

type JsonEditProps<T> = {
  data: T,
  name?: string
  parent?: object
  updateValue?: (value: T) => void
  onChange?: (ev: Event, detail: UpdateDetail) => void
  editElement?: boolean,
}

type UpdateDetail = {
  parent?: object
  name?: string
  oldValue: any
  newValue: any,
}
```

## Supported Data Type
  + HTMLElement
  + Text (DOM node)
  + string
  + number
  + timestamp (in number)
  + Date
  + bigint
  + boolean
  + function (show the source code)
  + symbol
  + undefined
  + null
  + Set
  + Map
  + Array
  + object

## Usage Examples

This section demo using s-json with surplus, however it is not required.

`JsonEdit`, `JsonView` are javascript functions, that upon calling, return HTMLElement(s).
Hence, it can be used with plain js as well.

**Sample Data**:
```typescript jsx
import * as Surplus from 'surplus';
Surplus;

export let sampleData = {
  username: 'Alice',
  age: 20,                  // render as input[type=number]
  todayTime: Date.now(),    // render as input[type=date] and input[type=time]
  todayDate: new Date(),
  salary: BigInt('12345'),  // render as input[type=text]
  isActive: true,
  sym: Symbol.for('alice'),
  partner: undefined,
  task: null,
  tagSet: new Set(['app', 'developer', 'web']),
  contactMap: new Map([
    [Symbol.for('bob'), {name: 'Bob', tel: '+85298765432'}],
    [Symbol.for('cherry'), {name: 'Cherry', tel: '+85223456789'}],
  ]),
  foodArr: ['seafood', 'potato'],
  profileObj: {
    name: 'Alice',
    age: 20,
  },
  // DOM elements
  friendNodes: [
    <span style={{fontSize: 'larger'}}>Bob</span>,
    <b>Cherry</b>,
    <a href='javascript:alert("clicked")'>Dave</a>,
    document.createTextNode('Eve'),
  ],
  // function
  onMessage: (msg: string) => alert('message: ' + msg),
}
```
Details refer to [demo-data.tsx](./demo/demo-data.tsx)

### Usage Example of `JsonView`
```typescript jsx
import * as Surplus from 'surplus';
import S from 's-js';
import { JsonView } from '../src/json-view';
import { sampleData } from './demo-data';
Surplus;

S.root(() => {
  // let main = JsonView({data: sampleData}) // without jsx
  let main = <JsonView data={sampleData} />; // with jsx
  document.body.appendChild(main);
});
```

### Usage Example of `JsonEdit`:
```typescript
import * as Surplus from 'surplus';
import S from 's-js';
import { JsonEdit, UpdateDetail } from '../src/json-edit';
import { sampleData } from './demo-data';
Surplus;

S.root(() => {
  let lastUpdate = S.data(Date.now());

  let main = (
    <div>
      Last update: {new Date(lastUpdate()).toLocaleString()}
      <h2>JsonEdit</h2>
      {JsonEdit({
        data: sampleData,
        editElement: true,
        onChange: (ev, { parent, name, newValue, oldValue }: UpdateDetail) => {
          console.log('change', { parent, name, newValue, oldValue });
          lastUpdate(Date.now());
        },
      })}
    </div>
  );
  document.body.appendChild(main);
});
```

### Remark
`JsonEdit` updates the data in-place. Therefore, if you need to use `JsonView` (or other elements) to display the data editing by `JsonEdit` on the same page, you'll need to use a change signal in the container of `JsonView`. For example:
```typescript jsx
import * as Surplus from 'surplus';
import S from 's-js';
import { JsonEdit } from '../src/json-edit';
import { JsonView } from '../src/json-view';
import { sampleData } from './demo-data';

Surplus;

S.root(() => {
  let lastUpdate = S.data(Date.now());

  function ChangeDetect(props: { signal: any; children: any }) {
    return props.children;
  }

  let main = (
    <div>
      Last update: {new Date(lastUpdate()).toLocaleString()}
      <div style={{ display: 'flex' }}>
        <div>
          <h2>JsonView</h2>
          <ChangeDetect signal={lastUpdate()}>
            <JsonView data={sampleData} />
          </ChangeDetect>
        </div>
        <div>
          <h2>JsonEdit</h2>
          {JsonEdit({
            data: sampleData,
            editElement: true,
            onChange: (ev, detail) => {
              console.log('change', detail);
              lastUpdate(Date.now());
            },
          })}
        </div>
      </div>
    </div>
  );
  document.body.appendChild(main);
});
```

Details see [demo.tsx](./demo/demo.tsx)
