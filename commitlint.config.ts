import nxScopesConfig from '@commitlint/config-nx-scopes';
import { RuleConfigSeverity } from '@commitlint/types';

export default {
  ...nxScopesConfig,
  rules: {
    ...nxScopesConfig.rules,
    'type-enum': (ctx) => {
      const projects = nxScopesConfig.utils.getProjects(ctx);

      return Promise.resolve([
        RuleConfigSeverity.Error,
        'always',
        [...projects, 'general'],
      ]);
    },
  },
};
