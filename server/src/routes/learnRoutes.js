import express from 'express';
import { getArticles, getArticleBySlug } from '../controllers/learnController.js';

const router = express.Router();

router.get('/articles', getArticles);
router.get('/articles/:slug', getArticleBySlug);

export default router;
