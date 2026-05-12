const { withAndroidMainActivity } = require('@expo/config-plugins');

module.exports = (config) => {
  return withAndroidMainActivity(config, (config) => {
    let { contents } = config.modResults;

    if (contents.includes('isNavigationBarContrastEnforced')) return config;

    if (config.modResults.language === 'kt') {
      contents = contents.replace(
        'super.onCreate(savedInstanceState)',
        'super.onCreate(savedInstanceState)\n    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) { window.isNavigationBarContrastEnforced = false }'
      );
    } else {
      contents = contents.replace(
        'super.onCreate(savedInstanceState);',
        'super.onCreate(savedInstanceState);\n    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) { getWindow().setNavigationBarContrastEnforced(false); }'
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
