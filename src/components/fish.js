import Ractive from 'ractive';
import template from './fish.ract';

export default Ractive.extend({
  template: template.template,
  css: `
    i {
      background-image: url('fish.png');
    }
  `
});
