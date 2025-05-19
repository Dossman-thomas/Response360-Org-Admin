import { Router } from 'express';
import {
  createOrganizationController,
  getAllOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationController,
  deleteOrganizationController,
} from '../controllers/index.js';
import {
  decryptOrgIdParam,
  validatePayload,
  validateOrgId
} from '../middleware/index.js';

export const organizationRouter = Router();

// Create an organization
organizationRouter.post(
  '/create',
  validatePayload,
  createOrganizationController
); // endpoint: /api/organization/create

// Read an organization
organizationRouter.post(
  '/read',
  validatePayload,
  getAllOrganizationsController
); // endpoint: /api/organization/read

// Read an organization by ID
organizationRouter.get(
  '/read/:encryptedOrgId',
  decryptOrgIdParam,
  validateOrgId,
  getOrganizationByIdController
); // endpoint: /api/organization/read/:encryptedOrgId

// Update an organization
organizationRouter.put(
  '/update/:encryptedOrgId',
  validatePayload,
  decryptOrgIdParam,
  validateOrgId,
  updateOrganizationController
); // endpoint: /api/organization/update/:encryptedOrgId

// Delete an organization
organizationRouter.delete(
  '/delete/:encryptedOrgId',
  validatePayload,
  decryptOrgIdParam,
  validateOrgId,
  deleteOrganizationController
); // endpoint: /api/organization/delete/:encryptedOrgId
