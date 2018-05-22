import Ractive from 'ractive';
import template from './main.ract';
import dayjs from 'dayjs';

import fish from './components/fish.js';
import meat from './components/meat.js';

const Main = new Ractive({
  el: 'root',
  template: template.template,
  components: {
    Fish: fish,
    Meat: meat
  },
  data: {
    activate: 0,
    head: [
      'Fish',
      'Meat'
    ],
    year: dayjs().format('YYYY')
  },
  oninit() {
    this.on('active', (evt, i) => {
      this.set('activate', i);
    });
  }
});

export default Main;
