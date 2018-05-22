import Ractive from 'ractive';
import template from './meat.ract';

export default Ractive.extend({
  template: template.template,
  css: `
    i {
      background-image: url('meat.png');
    }
  `
});
