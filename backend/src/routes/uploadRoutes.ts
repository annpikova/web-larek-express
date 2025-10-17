import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import fileMiddleware from '../middlewares/file';
import auth from '../middlewares/auth';

const router = Router();

router.post('/upload', auth, fileMiddleware.single('file'), uploadFile);

export default router;
