# Baseview

This library is a experimental idea that act as starter class for Backbone Views. The goal was to use a Model for each view that will has subviews handled by collections.

Each view can append subviews directly referenced as children, which could be accessible from the parent view. This presents the idea to manage the UI with models and collections.

## Api

Each view is extended with the next methods:

* **disable** - Adds a class `disable` to the $el, sets a `disabled` flag to true and dispatches an event `onDisable`.
* **enable** - Removes the class `disable` on the view's $el, sets the `disabled` flag to false and dispatches the event `onEnable`.
* **active** - Adds a class `active` to the $el, sets a `active` flag to true and dispatches the event `onActivate`.
* **deactivate** - Removes the class `active` on the view's $el, sets the `active` flag to false and dispatches the event `onDeactivate`.
* **destroy** - This executes a method `onDestroy`, you can add possible unbindings or other removements in it.
* **refresh** - Compiles and serializes before append to an element in the DOM. Components that need to update partial elements should handle their own refreshes.
* **appendView** and **removeView** - Private methods that build and delete subviews automagically.

## Mehods that can be overwritten

```javascript
  onStart : function() {},
  onRefresh : function() {},
  onDestroy : function() {},
  onActivate : function() {},
  onDeactivate : function() {},
  onEnable : function() {},
  onDisable : function() {},
  addListeners : function() {} // This is triggered when events of change are attached to the view model
```
