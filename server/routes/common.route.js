import { Router } from "express";
import { encryptController, decryptController } from "../controllers/index.js";

export const commonRouter = Router();

commonRouter.post("/encrypt", encryptController); // endpoint: /api/common/encrypt

commonRouter.post("/decrypt", decryptController); // endpoint: /api/common/decrypt
