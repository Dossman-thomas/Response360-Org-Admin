import { Router } from "express";
import { uploadLogoController } from "../controllers/index.js";

export const imageUploadRouter = Router();

imageUploadRouter.post("/upload-logo", uploadLogoController); // endpoint: /api/image/upload-logo