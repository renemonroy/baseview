(function(ctx) {

  /**
   * Removes the class 'disabled' of the $el on DOM. It also
   * changes the 'disabled' flag to false.
   **/
  var enable = function(view) {
    view.$el.removeClass('disable').attr('disabled', false);
    view.onEnable();
    return view;
  },

  /**
   * Add the class 'disabled' of the $el on DOM. It also
   * changes the 'disabled' flag to true.
   **/
  disable = function(view) {
    view.$el.addClass('disable').attr('disabled', true);
    view.onDisable();
    return view;
  },

  /**
   * Add a class of active to the $el on DOM. It also changes
   * the 'active' flag to true.
   **/
  activate = function(view) {
    view.$el.addClass('active');
    view.onActivate();
    return view;
  },

  /**
   * Removes the class 'deactive' to the $el on DOM. It also
   * changes the active flag to false.
   **/
  deactivate = function(view) {
    view.$el.removeClass('active');
    view.onDeactivate();
    return view;
  },

  /**
   * These events only are in charge to change the classes
   * used for each component.
   **/
  listenEvents = function(view) {
    view.listenTo(view.model, 'change:active', function() {
      if ( view.model.get('active') === true ) activate(view);
      else deactivate(view);
    });
    view.listenTo(view.model, 'change:disable', function() {
      if ( view.model.get('disable') === true ) disable(view);
      else enable(view);
    });
    view.addListeners();
    return view;
  },

  /**
   * If you need to override destroy then triple check all
   * of the events that need to unbound. This method is very
   * important as tries to avoid memory leaks.
   **/
  destroy = function(view) {
    var subviews;

    view.undelegateEvents();
    view.$el.removeData().unbind();
    if ( view.model ) view.model.off(null, null, view);
    if ( view.collection ) view.collection.off(null, null, view);

    view.remove();

    if ( view.subviews !== null && view.subviews.length > 0 ) {
      subviews = [].concat(view.subviews);
      for (var i=0; i<subviews.length; i++) {
        subviews[i].destroy();
      }
    }

    view.subviews = null;
    view.$el = null;
  },

  /**
   * When a Component has a model or collectio to manage data,
   * this method is executed to return a serialized info.
   **/
  serializeData = function(view) {
    var data = null;
    if ( view.model ) data = view.model.toJSON();
    if ( view.collection ) data.items = view.collection.toJSON();
    return data;
  },

  /**
   * It returns a stringified HTML that will be appended into
   * the component element "$el".
   **/
  compileTemplate = function(data, view) {
    return _.template(view.template, data);
  },

  /**
   * Model that will be used in all views. This way each view
   * will have a model that will inherit this default attrs.
   **/
  BaseModel = Backbone.Model.extend({}),
  BaseCollection = Backbone.Collection.extend({}),

  /**
   * Class used as base for all views. It has functions that
   * can be overriden  but that are specified after the
   * constructor method. The other methods are public but those
   * should not be overriden. There's more methods provided
   * that are helpful to handle changes.
   **/
  BaseView = Backbone.View.extend({

    template : '',
    className : 'ui-component',
    _parent : null,

    initialize : function(options) {
      var base = this,
        events = {},
        defaults = {
          active : true,
          disable : false
        };
      this.subviews = [];
      if ( options.viewName ) {
        this.viewName = options.viewName;
      }
      if ( !this.collection ) {
        this.collection = new BaseCollection();
      }
      if ( !this.model ) {
        this.model = new BaseModel();
      }
      if ( this.defaults ) {
        defaults = _.extend(defaults, this.defaults);
      }
      if ( options && options.defaults ) {
        defaults = _.extend(defaults, options.defaults);
      }
      defaults = _.extend(defaults, this.model.defaults);
      this.model.set(defaults);
      this.refresh();
      listenEvents(this).onStart();
    },

    /**
     * Override these methods if you need to add a specific
     * behavior on api actions.
     **/
    onStart : function() {},
    onRefresh : function() {},
    onDestroy : function() {},
    onActivate : function() {},
    onDeactivate : function() {},
    onEnable : function() {},
    onDisable : function() {},
    addListeners : function() {},

    /**
     * This method should not be overrided. Nor the _destroy()
     * one unless is absolutely necessary. This executes a
     * method onDestroy, you can add possible unbindings or
     * other removements in it.
     * @return {null} Null object
     */
    destroy : function() {
      this.onDestroy();
      destroy(this);
      if ( this._parent ) this._parent.removeView(this);
      return null;
    },

    /**
     * Compiles and serializes before append to an element
     * in the DOM. Components that need to update partial
     * elements should handle their own refreshes.
     * @return {obj} This class obj to chain
     */
    refresh : function() {
      var compiled = compileTemplate(serializeData(this), this);
      this.$el.html(compiled);
      this.onRefresh();
      return this;
    },

    /**
     * It does exactly what it says, it renders the $el in a
     * specified element. You can render on a position, which
     * follows the names of insertAdjacentHTML spec.
     * @param  {jQuery obj} el Element to insert in the DOM
     * @param  {string} pos  Follows querySelector convention
     * @return {obj}  This class obj to chain
     */
    render : function(el, pos) {
      switch (pos) {
        case 'beforebegin' :
          this.$el.insertBefore(el);
          break;
        default :
          this.$el.appendTo(el);
          break;
      }
      return this;
    },

    /**
     * Creates a new child view to the current one. This
     * helps to handle subviews from a parent component.
     * @param {class obj} subView Subview class obj
     */
    appendView : function(subView) {
      this.collection.add(subView.model);
      if ( subView._parent ) subView._parent.removeView(subView);
      if ( !this.hasOwnProperty('subviews') ) this.subviews = [];
      this.subviews.push(subView);
      this[subView.viewName] = subView;
      subView._parent = this;
      return subView;
    },

    /**
     * Removes a child specified from its instance. When a
     * component that has children, this method is executed
     * for each sub components to destroy them all.
     * @param {class obj} view Subview class obj
     */
    removeView : function(view) {
      var pos = this.subviews.indexOf(view);
      if ( pos !== -1 ) {
        this.subviews.splice(pos, 1);
        delete this[view.viewName];
        view._parent = null;
      }
      return view;
    }

  });

  ctx.BaseView = BaseView;

})(this.App || this);
