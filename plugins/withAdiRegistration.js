const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAdiRegistration(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // Caminho do arquivo: vem da env var (EAS file env var) ou do arquivo local.
      const source =
        process.env.ADI_REGISTRATION_PROPERTIES ||
        path.join(config.modRequest.projectRoot, 'assets/adi-registration.properties');

      if (!fs.existsSync(source)) {
        console.warn(
          `[withAdiRegistration] adi-registration.properties não encontrado em "${source}". ` +
          'Pulando cópia. Defina a env var ADI_REGISTRATION_PROPERTIES (tipo file) no EAS ' +
          'ou mantenha o arquivo em assets/ para builds locais.'
        );
        return config;
      }

      const assetsDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      fs.copyFileSync(source, path.join(assetsDir, 'adi-registration.properties'));
      return config;
    },
  ]);
};
