import './slider.scss';
import '../helpers/types';

import jQuery from 'jquery';
import Presenter from './components/presenter/presenter';

(function($) {
  $.fn.slider = function(props: any) {
    return new Presenter(props);
  };
})(jQuery);

export {Presenter as Slider};
