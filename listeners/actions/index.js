import { requestTypeActionCallback } from './request-type-action.js';

export const register = (app) => {
  app.action('request_type_access', requestTypeActionCallback);
  app.action('request_type_equipment', requestTypeActionCallback);
  app.action('request_type_other', requestTypeActionCallback);
};
