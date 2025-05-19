import { validate as validateUuid } from 'uuid';
import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';

export const validateOrgId = (req, res, next) => {
  const { orgId } = req.params;

  if (!orgId || !validateUuid(orgId)) {
    return response(res, {
      statusCode: 400,
      message: messages.organization.INVALID_ORGANIZATION_ID,
    });
  }

  next();
};
