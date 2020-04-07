import * as Surplus from 'surplus';
import S from 's-js';
import { sampleData } from 'stencil-lib/components/json/json-common';
import { JsonEdit } from './src/json-edit';
import { JsonView } from './src/json-view';

// tslint:disable-next-line no-unused-expression
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

  function raw(_signal: any) {
    const data = { ...sampleData };
    data.salary = '(cannot encode bigint)';
    return <pre><code>{JSON.stringify(data, undefined, 2)}</code></pre>;
  }

  let main =
    <div>
      Last update: {new Date(lastUpdate()).toLocaleString()}
      <div class='main'>
        <div>
          <h2>
            JSON
          </h2>
          <div class='demo'>{raw(lastUpdate())}</div>
          <h2>
            JsonView
          </h2>
          <div class='demo'>
            {view(lastUpdate())}
          </div>
        </div>
        <div>
          <h2>
            JsonEdit
          </h2>
          <div class='demo'>
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
    </div>;
  document.body.appendChild(main);
  Object.assign(window, { sampleData });
});
