try {
  if ( window.App ) {
    console.warn("App defined.");
  } else {
    App = {};
  }
} catch (err) {
  App = {};
}

App = {
  Mixins : App.Mixins || {},
  Views : App.Views || {},
  Models : App.Models || {},
  Collections : App.Collections || {}
};
