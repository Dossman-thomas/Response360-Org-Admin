import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';

export const validatePayload = (req, res, next) => {
  const { payload } = req.body;

  if (!payload) {
    return response(res, {
      statusCode: 400,
      message: messages.general.NO_PAYLOAD,
    });
  }

  next();
};
