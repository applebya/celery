const rewireReactHotLoader = require('react-app-rewire-hot-loader');

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireReactHotLoader(config, env);

  // config.resolve.alias = {
  //   ...config.resolve.alias,
  //   'react-dom': '@hot-reloader/react-dom'
  // };

  return config;
};
