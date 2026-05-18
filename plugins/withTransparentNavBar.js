const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withTransparentNavBar(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const packagePath = config.android?.package?.replace(/\./g, '/') ?? 'com/devvale/LocVac';
      const mainActivityDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java',
        packagePath
      );

      let mainActivityPath = path.join(mainActivityDir, 'MainActivity.kt');
      let isKotlin = true;
      if (!fs.existsSync(mainActivityPath)) {
        mainActivityPath = path.join(mainActivityDir, 'MainActivity.java');
        isKotlin = false;
      }

      if (!fs.existsSync(mainActivityPath)) return config;

      let contents = fs.readFileSync(mainActivityPath, 'utf8');

      if (contents.includes('isNavigationBarContrastEnforced')) return config;

      if (isKotlin) {
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

      fs.writeFileSync(mainActivityPath, contents, 'utf8');
      return config;
    },
  ]);
};
