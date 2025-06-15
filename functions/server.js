const express = require('express');
const serverless = require('serverless-http');
const app = require('../app');

// Create a serverless handler
const handler = serverless(app);

// Export the handler
module.exports.handler = async (event, context) => {
  // Add CORS headers
  const response = await handler(event, context);
  return {
    ...response,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    }
  };
}; 