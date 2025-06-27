const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('tiny'));

let persons = [
  { 
    id: 1,
    name: "Arto Hellas", 
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace", 
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov", 
    number: "12-43-234345"
  },
  { 
    id: 4,
    name: "Mary Poppendieck", 
    number: "39-23-6423122"
  }
];

app.get('/', (request, response) => {
  response.send(
    '<h1>Phonebook Backend</h1>' +
    '<p>Access phonebook entries at <a href="/api/persons">/api/persons</a></p>' +
    '<p>Access info at <a href="/info">/info</a></p>'
  );
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const initialLength = persons.length;
  persons = persons.filter(person => person.id !== id);

  if (persons.length < initialLength) {
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

app.get('/info', (request, response) => {
    const numberOfPersons = persons.length;
    const requestTime = new Date();

    const infoResponse = `
      <p>Phonebook has info for ${numberOfPersons} people</p>
      <p>${requestTime}</p>
    `;
    response.send(infoResponse);
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access phonebook data at http://localhost:${PORT}/api/persons`);
  console.log(`Access backend info at http://localhost:${PORT}/info`); 
});
