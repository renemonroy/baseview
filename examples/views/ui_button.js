App.Views.UIButton = App.BaseView.extend({

  tagName : 'button',
  template : '<%= label %>',
  className : 'ui-button',

  defaults : {
    label : 'Button'
  },

  events : {
    click : 'onClick'
  },

  onClick : function(e) {
    if ( !this.disabled ) {
      e.preventDefault();
      this.trigger('click', {
        originalEvent : e
      });
    }
  },

  addListeners : function() {
    var btn = this;
    this.listenTo(this.model, 'change:label', function() {
      btn.refresh();
    });
  },

  onDestroy : function() {
    this.unbind('click');
  }

});
