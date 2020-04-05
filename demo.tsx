import * as Surplus from 'surplus';

Surplus;
import { sampleData } from 'stencil-lib/components/json/json-common';
import { JsonView } from './src/s-json-view';

sampleData.friendNodes = [
  <span style={{ fontSize: 'larger' }}>Bob</span>,
  <b>Cherry</b>,
  <a href='javascript:alert("clicked")'>Dave</a>,
];

let main = JsonView({
  data: sampleData,
  // expandElement: true,
});
document.body.appendChild(main);
// setTimeout(() => location.reload(), 500);
