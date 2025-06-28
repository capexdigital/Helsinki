const mongoose = require('mongoose');

// Command-line argument handling
// Usage:
//   node mongo.js <password> "Name Name" "Number"   (add entry)
//   node mongo.js <password>                         (list entries)
const numArgs = process.argv.length;

if (numArgs < 3) {
  console.log('Usage:');
  console.log('  To add a person: node mongo.js <password> "Name Name" "Number"');
  console.log('  To list all persons: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];
const name = numArgs >= 4 ? process.argv[3] : null;
const number = numArgs >= 5 ? process.argv[4] : null;

// MongoDB Connection String components
const mongoDbUser = 'capex';
const mongoDbCluster = 'cluster0.ky3nm8j.mongodb.net';
const mongoDbName = 'phonebookApp';

// CORRECTED: Construct the URL using the provided components and password
const url = `mongodb+srv://${mongoDbUser}:${password}@${mongoDbCluster}/${mongoDbName}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

console.log('Attempting to connect to MongoDB...');

// Define the Person schema and model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

// Connect and perform database operations
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB successfully!');

    if (name && number) {
      const person = new Person({
        name: name,
        number: number,
      });
      return person.save();
    } else {
      return Person.find({});
    }
  })
  .then((result) => {
    if (name && number) {
      console.log(`Added ${name} number ${number} to phonebook`);
    } else {
      console.log('Phonebook:');
      if (result.length === 0) {
        console.log('  No entries found.');
      } else {
        result.forEach(person => {
          console.log(`  ${person.name} ${person.number}`);
        });
      }
    }
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
