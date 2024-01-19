const express = require("express");

const apiRouter = express.Router({ mergeParams: true });

const userRouter = require("./user.routes");
const projectsRouter = require("./project.routes");
const favoutiesRouter = require("./favourites.routes");
const hireRouter = require("./hire.routes");
const searchRouter = require("./search.routes");
const applicationRouter = require("./application.routes");
const messagesRouter = require("./message.routes");
const chatRouter = require("./chat.routes");
const categoryRouter = require("./category.routes");
const qualificationRouter = require("./qualification.routes");
const notificationRouter = require("./notification.routes");
const resourcesRouter = require("./resources.routes");
const pdf_extractor = require("./pdfFileService.routes");
const invitation = require("./invitation.routes");
const dashboard = require("./dashboard.routes");

apiRouter.use("/search", searchRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/favourites", favoutiesRouter);
apiRouter.use("/hire", hireRouter);
apiRouter.use("/application", applicationRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/category", categoryRouter);
apiRouter.use("/qualification", qualificationRouter);
apiRouter.use("/resources", resourcesRouter);
apiRouter.use("/notification", notificationRouter);
apiRouter.use("/pdf_extractor", pdf_extractor);
apiRouter.use("/invitation", invitation);
apiRouter.use("/dashboard", dashboard);

module.exports = apiRouter;
