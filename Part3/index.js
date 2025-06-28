require('dotenv').config() // Load environment variables from .env file
const express = require('express')
const morgan = require('morgan')
const cors = require('cors') // Enable Cross-Origin Resource Sharing
const app = express()
const mongoose = require('mongoose') // Import Mongoose

// --- MongoDB Connection Setup ---
// Get MongoDB URI from environment variables (recommended for security)
const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('Connecting to MongoDB...')

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
  })

// --- Mongoose Schema and Model Definition for Person ---
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d{5,}$|^\d{8,}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number format!`
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

// --- Middleware Definitions ---
const requestLogger = (request, response, next) => {
  console.log('---')
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('dist')) // Serve frontend static files
app.use(express.json()) // Parse JSON request bodies
app.use(cors()) // Enable CORS for all routes
app.use(requestLogger) // Log request details

morgan.token('req-body', function (request) {
  return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body -------'))

// --- API Routes ---
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(result => {
      response.json(result)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(result => {
      response.send(
        `<p>The phonebook has info for ${result.length} people</p>
         <p>${new Date()}</p>`
      )
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // Check for missing name or number
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson) // Respond with 201 Created and the saved person
    })
    .catch(error => next(error)) // Pass validation or other errors to errorHandler
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  
  const person = {
    name,
    number
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person, // Use the person object for update
    { new: true, runValidators: true, context: 'query' }) // 'new: true' returns the updated document
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// --- Error Handling Middleware ---
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.code === 11000 && error.keyPattern && error.keyPattern.name === 1) {
    return response.status(409).json({ error: 'expected `name` to be unique' })
  }

  next(error)
}
app.use(errorHandler)

// --- Server Start ---
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})