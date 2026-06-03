import { resolveCodespacesServiceUrl } from '../app/core/services/url-utils';

export const environment = {
  production: false,
  apiUrl: `${resolveCodespacesServiceUrl(5000)}/api`
};