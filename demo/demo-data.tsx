import * as Surplus from 'surplus';
// tslint:disable-next-line no-unused-expression
Surplus;
export let sampleData = {
  // string
  username: 'Alice',
  // number
  age: 20,
  // timestamp (in number)
  todayTime: Date.now(),
  // bigint
  salary: BigInt('12345'),
  // boolean
  isAdmin: false,
  isActive: true,
  // function
  onMessage: (msg: string) => alert('message: ' + msg),
  // symbol
  sym: Symbol.for('alice'),
  // undefined
  partner: undefined,
  // null
  task: null,
  // Date
  todayDate: new Date(),
  // Set
  tagSet: new Set(['app', 'developer', 'web']),
  // Map
  contactMap: new Map([
    [Symbol.for('bob'), { name: 'Bob', tel: '+85298765432' }],
    [Symbol.for('cherry'), { name: 'Cherry', tel: '+85223456789' }],
  ]),
  // Array
  foodArr: ['seafood', 'potato'],
  // DOM element
  friendNodes: [
    <span style={{ fontSize: 'larger' }}>Bob</span>,
    <b>Cherry</b>,
    <a href='javascript:alert("clicked")'>Dave</a>,
    document.createTextNode('Eve'),
  ],
  // object
  profileObj: {
    name: 'Alice',
    age: 20,
  },
};
