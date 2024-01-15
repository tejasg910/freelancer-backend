const express = require('express');
const router = express.Router({ mergeParams: true });

const QualificationsController = require('../../controllers/qualification.controller')
const { useTryCatch } = require('../../services/utility.service');

router.get('/', useTryCatch(QualificationsController));

module.exports = router;
