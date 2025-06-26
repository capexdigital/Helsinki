const express = require('express');
const app = express();

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
  // Combine all HTML into a single string to be sent
  response.send(
    '<h1>Phonebook Backend</h1>' +
    '<p>Access phonebook entries at <a href="/api/persons">/api/persons</a></p>' +
    '<h2>Backend Info</h2>' + 
    '<p>Access info at <a href="/info">/info</a></p>'
  );
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

// New /info route to provide dynamic information
app.get('/info', (request, response) => {
    const numberOfPersons = persons.length; // Get the current number of entries
    const requestTime = new Date(); // Get the current timestamp

    const infoResponse = {
        message: `Phonebook has info for ${numberOfPersons} people`,
        timestamp: requestTime.toString() // Convert the date object to a readable string
    };
    response.json(infoResponse); // Send the dynamic info as JSON
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access phonebook data at http://localhost:${PORT}/api/persons`);
  console.log(`Access backend info at http://localhost:${PORT}/info`); 
});
