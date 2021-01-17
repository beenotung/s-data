import * as Surplus from 'surplus';
import S from 's-js';
import { JsonView } from '../src/json-view';
import { sampleData } from './demo-data';

// tslint:disable-next-line no-unused-expression
Surplus;

S.root(() => {
  // let main = JsonView({data: sampleData}) // without jsx
  let main = <JsonView data={sampleData} />; // with jsx
  document.body.appendChild(main);
});
