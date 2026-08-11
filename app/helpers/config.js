const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.API_URL_PROD
    : process.env.API_URL_DEV;
console.log("Basic URL =====================> ", BASE_URL)

export default {
  BASE_URL: BASE_URL || 'http://localhost:45686/', // Base URL for the API
  webUrl: BASE_URL || 'http://localhost:3000/', // Base URL for the web app
  apiUrl: BASE_URL || 'http://localhost:45686/', // Base URL for the API
  wsUrl: 'ws://localhost:8000/', // WebSocket URL
  basicKey: process.env.BASIC_KEY || 'xxfbghvhbkjlktyiopopýVCXsdwa$334345324#weFZcZVFXB', // Basic key for authentication 
  apiPaths: {
    studentEnrollment: {
      list: 'api/student/list', // Path to get the list of students
      create: 'api/student/create', // Path to create a new student
      update: 'api/student/update', // Path to update an existing student
    },
    otherEndpoints: {
      login: 'api/auth/login', // Example other endpoint
    }
  }
};
