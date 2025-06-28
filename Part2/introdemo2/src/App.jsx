import React, { useState, useEffect } from 'react';

function App() {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  // Base URL for the backend API.
  const baseUrl = 'http://localhost:3001/api/persons';

  // Fetch initial data from the backend when the component mounts
  useEffect(() => {
    fetch(baseUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((initialPersons) => {
        setPersons(initialPersons);
      })
      .catch((error) => {
        console.error('Error fetching persons:', error);
        showMessage('Failed to load phonebook entries.', 'error');
      });
  }, []);

  // Handle adding a new person or updating an existing one
  const addPerson = (event) => {
    event.preventDefault(); // Prevent default form submission (page reload)

    const existingPerson = persons.find(
      (p) => p.name.toLowerCase() === newName.toLowerCase()
    );

    if (existingPerson) {
      // If name exists, confirm update of number
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        fetch(`${baseUrl}/${existingPerson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPerson),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((errorData) => {
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
              });
            }
            return response.json();
          })
          .then((returnedPerson) => {
            setPersons(persons.map((person) => person.id !== returnedPerson.id ? person : returnedPerson));
            showMessage(`Updated ${returnedPerson.name}'s number`, 'success');
            setNewName('');
            setNewNumber('');
          })
          .catch((error) => {
            console.error('Error updating person:', error);
            showMessage(`Error updating ${newName}: ${error.message}`, 'error');
          });
      }
    } else {
      // Create new person object
      const personObject = {
        name: newName,
        number: newNumber,
      };

      // Send POST request to backend
      fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personObject),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            });
          }
          return response.json();
        })
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson));
          showMessage(`Added ${returnedPerson.name}`, 'success');
          setNewName('');
          setNewNumber('');
        })
        .catch((error) => {
          console.error('Error adding person:', error);
          showMessage(`Error adding person: ${error.message}`, 'error');
        });
    }
  };

  // Handle deleting a person
  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.status === 204) { // 204 No Content typically for successful DELETE
            setPersons(persons.filter((person) => person.id !== id));
            showMessage(`Deleted ${name}`, 'success');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        })
        .catch((error) => {
          console.error('Error deleting person:', error);
          showMessage(`Error deleting ${name}: ${error.message}`, 'error');
        });
    }
  };

  // Input change handlers
  const handleNameChange = (event) => setNewName(event.target.value);
  const handleNumberChange = (event) => setNewNumber(event.target.value);
  const handleFilterChange = (event) => setFilter(event.target.value);

  // Filter persons by name or number (case-insensitive)
  const personsToShow = filter
    ? persons.filter((person) =>
      person.name.toLowerCase().includes(filter.toLowerCase()) ||
        person.number.toLowerCase().includes(filter.toLowerCase())
    )
    : persons;

  // Show temporary messages
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType('');
    }, 5000);
  };

  // Notification component (inline basic styling)
  const Notification = ({ message, type }) => {
    if (message === null) return null;

    const style = {
      padding: '10px',
      marginBottom: '10px',
      border: '2px solid',
      borderRadius: '5px',
      textAlign: 'center',
      fontWeight: 'bold',
    };

    if (type === 'success') {
      style.backgroundColor = '#d4edda';
      style.color = '#155724';
      style.borderColor = '#28a745';
    } else { // 'error'
      style.backgroundColor = '#f8d7da';
      style.color = '#721c24';
      style.borderColor = '#dc3545';
    }

    return <div style={style}>{message}</div>;
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Phonebook</h1>

      <Notification message={message} type={messageType} />

      <h2>Search Contacts</h2>
      <div>
        <label htmlFor="filter">Filter shown with:</label>
        <input
          id="filter"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Type to filter names or numbers..."
        />
      </div>

      <h2>Add a new contact</h2>
      <form onSubmit={addPerson}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            value={newName}
            onChange={handleNameChange}
            placeholder="Enter name..."
            required
          />
        </div>
        <div>
          <label htmlFor="number">Number:</label>
          <input
            id="number"
            value={newNumber}
            onChange={handleNumberChange}
            placeholder="Enter number..."
            required
          />
        </div>
        <div>
          <button type="submit">Add</button>
        </div>
      </form>

      <h2>Numbers</h2>
      {personsToShow.length > 0 ? (
        <ul>
          {personsToShow.map((person) => (
            <li key={person.id}>
              {person.name} {person.number}
              <button onClick={() => deletePerson(person.id, person.name)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No contacts found. Add one!</p>
      )}
    </div>
  );
}

export default App;