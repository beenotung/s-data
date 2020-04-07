import * as Surplus from 'surplus';
import S from 's-js';
import { sampleData } from 'stencil-lib/components/json/json-common';
import { JsonEdit } from './src/json-edit';
import { JsonView } from './src/json-view';

Surplus;
S.root(() => {
  sampleData.friendNodes = [
    <span style={{ fontSize: 'larger' }}>Bob</span>,
    <b>Cherry</b>,
    <a href='javascript:alert("clicked")'>Dave</a>,
    document.createTextNode('Eve'),
  ];

  let lastUpdate = S.data(Date.now());

  function view(_signal: any) {
    return <JsonView data={sampleData}/>;
  }

  let main =
    <div>
      Last update: {new Date(lastUpdate()).toLocaleString()}
      <div class='main'>
        {view(lastUpdate())}
        {JsonEdit({
          data: sampleData,
          editElement: true,
          onChange: (ev, detail) => {
            console.log('change', detail);
            lastUpdate(Date.now());
          },
        })}
      </div>
    </div>;
  document.body.appendChild(main);
  Object.assign(window, { sampleData });
});
