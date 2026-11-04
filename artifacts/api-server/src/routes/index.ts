import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import recentWorkRouter from "./recent-work";
import mediaRouter from "./media";
import portalRouter from "./portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(recentWorkRouter);
router.use(mediaRouter);
router.use(portalRouter);

export default router;
