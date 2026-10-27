const dns = require('node:dns');

const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers.length) dns.setServers(dnsServers);

const dnsOverHttpsEnabled = process.env.MONGODB_DNS_OVER_HTTPS === 'true';
const lookup = dnsOverHttpsEnabled ? require('./dnsOverHttps')() : undefined;
const mongoose = require('mongoose');

let connectionPromise;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      ...(lookup ? { lookup } : {}),
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}

mongoose.connection.on('disconnected', () => {
  connectionPromise = undefined;
});

module.exports = connectDatabase;
