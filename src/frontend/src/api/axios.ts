import axios from 'axios';

export const api = axios.create({
  // SOSTITUISCI CON LA PORTA DEL TUO BACKEND!
  // Esempio: 'http://localhost:5111' o 'https://localhost:7063'
  baseURL: 'https://localhost:7063', 
  headers: {
    'Content-Type': 'application/json',
  },
});