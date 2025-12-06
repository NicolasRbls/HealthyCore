const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HealthyCore API',
            version: '1.0.0',
            description: 'API documentation for HealthyCore application',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.routes.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
