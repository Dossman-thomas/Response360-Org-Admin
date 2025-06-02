import { getActiveCollectionsService } from '../services/index.js';
import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';

// Controller to handle retrieving active collections
export const getActiveCollectionsController = async (req, res) => {
  try {
    const { payload } = req.body;

    const encryptedCollectionData = await getActiveCollectionsService(payload);

    if (!encryptedCollectionData) {
      return response(res, {
        statusCode: 404,
        message: messages.collection.COLLECTIONS_NOT_FOUND,
      });
    }

    return response(res, {
      statusCode: 200,
      message: messages.collection.COLLECTIONS_FOUND,
      data: encryptedCollectionData,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};