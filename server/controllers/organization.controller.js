import {
  createOrganizationService,
  getAllOrganizationsService,
  getOrganizationByIdService,
  updateOrganizationService,
  deleteOrganizationService,
} from '../services/index.js';
import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';
import { validate as validateUuid } from 'uuid';

// Controller to handle the creation of an organization
export const createOrganizationController = async (req, res) => {
  try {
    // Validate the incoming request data
    const { payload } = req.body;

    // Call the createOrganizationService to handle the creation logic
    await createOrganizationService(payload);

    // Return the successful response
    return response(res, {
      statusCode: 201,
      message: messages.organization.ORGANIZATION_ADDED,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};

// Controller to handle the reading of an organization
export const getAllOrganizationsController = async (req, res) => {
  try {
    const { payload } = req.body;

    const encryptedOrgData = await getAllOrganizationsService(payload);

    if (!encryptedOrgData) {
      return response(res, {
        statusCode: 404,
        message: messages.organization.ORGANIZATION_NOT_FOUND,
      });
    }

    return response(res, {
      statusCode: 200,
      message: messages.organization.ORGANIZATION_FOUND,
      data: encryptedOrgData,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};

// Controller to handle the reading of an organization by ID
export const getOrganizationByIdController = async (req, res) => {
  try {
    const { orgId } = req.params;

    const encryptedOrgData = await getOrganizationByIdService(orgId);

    // Check if organization was found
    if (!encryptedOrgData) {
      return response(res, {
        statusCode: 404,
        message: messages.organization.ORGANIZATION_NOT_FOUND,
      });
    }

    return response(res, {
      statusCode: 200,
      message: messages.organization.ORGANIZATION_FOUND,
      data: encryptedOrgData,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};

// Controller to handle the updating of an organization
export const updateOrganizationController = async (req, res) => {
  try {
    // Validate the incoming request data
    const { payload } = req.body;
    const { orgId } = req.params; // Get the organization ID from the URL params

    // Call the updateOrganizationService to handle the update logic
    await updateOrganizationService(orgId, payload);

    // Return the successful response
    return response(res, {
      statusCode: 200,
      message: messages.organization.ORGANIZATION_UPDATED,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};

// Controller to handle the deletion of an organization
export const deleteOrganizationController = async (req, res) => {
  try {
    // Validate the incoming request data
    const { payload } = req.body;
    const { orgId } = req.params; // Get the organization ID from the URL params

    // Call the deleteOrganizationService to handle the soft deletion
    await deleteOrganizationService(orgId, payload);

    // Step 3: Return the successful response
    return response(res, {
      statusCode: 200,
      message: messages.organization.ORGANIZATION_DELETED,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};
