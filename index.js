const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const mealRoutes = require('./src/routes/meal.routes')
const authRoutes = require('./src/routes/authentication.routes').routes
const logger = require('./src/util/logger')
const bodyParser = require('body-parser');

const app = express()

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000

// Dit is een voorbeeld van een simpele route
app.get('/api/info', (req, res) => {
    logger.info("Info called")
    const info = {
        name: 'Share-A-Meal API',
        version: '1.0.0',
        description: [
            'Student: Jeffrey van Tillo',
            'Studentnummer: 2183234',
            'Deze API server is gemaakt voor Avans Hogeschool om aan te tonen dat ik de vaardigheid heb om een RESTfull API te maken met verschillende functionaliteiten.' +
            'Zoals het maken van objecten, filteren en het gebruiken van authorisatie.',
            'Bruikbare routes zijn',
            '/api/auth/login',
            '/api/user',
            '/api/user/{ID}',
            '/api/meal',
            '/api/meal/{ID}',
        ]
    }
    
    res.json(info)
})

// Hier komen alle routes
app.use(authRoutes)
app.use(userRoutes)
app.use(mealRoutes)

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
