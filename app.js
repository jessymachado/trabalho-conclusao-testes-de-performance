const express = require('express');
const userController = require('./controller/userController');
const agendamentoController = require('./controller/agendamentoController');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', userController);
app.use('/', agendamentoController);

module.exports = app;
