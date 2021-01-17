import * as Surplus from 'surplus';
import S from 's-js';
import { JsonEdit, UpdateDetail } from '../src/json-edit';
import { sampleData } from './demo-data';

// tslint:disable-next-line no-unused-expression
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
