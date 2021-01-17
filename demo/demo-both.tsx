import * as Surplus from 'surplus';
import S from 's-js';
import { JsonEdit } from '../src/json-edit';
import { JsonView } from '../src/json-view';
import { sampleData } from './demo-data';

// tslint:disable-next-line no-unused-expression
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
