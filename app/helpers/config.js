const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.API_URL_PROD
    : process.env.API_URL_DEV;
console.log("Basic URL =====================> ", BASE_URL)

export default {
  BASE_URL: BASE_URL || 'http://localhost:58721/', // Base URL for the API 45686
  webUrl: process.env.WEB_URL_DEV || 'http://localhost:3001/', // Base URL for the web app
  apiUrl: BASE_URL || 'http://localhost:58721/', // Base URL for the API
  wsBase: 'ws://localhost:58721/', // WebSocket URL
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
