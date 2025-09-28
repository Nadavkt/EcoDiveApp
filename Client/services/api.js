// Minimal API helpers for JSON and multipart requests
// Configure your API base URL via EXPO_PUBLIC_API_URL; fallback to local dev server

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.100.102.5:3001';

// Debug logging
console.log('=== API CONFIGURATION ===');
console.log('API Base URL:', BASE_URL);
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('Expected URL: https://7022e2115c11.ngrok-free.app');
console.log('URLs match:', BASE_URL === 'https://7022e2115c11.ngrok-free.app');
console.log('========================');

async function requestJson(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log('Making request to:', url, 'with options:', options);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options
    });
    
    clearTimeout(timeoutId);
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Request failed ${res.status}: ${text}`);
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 60 seconds');
    }
    console.error('Request error:', error);
    throw error;
  }
}

async function requestMultipart(path, formData, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log('Making multipart request to:', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file uploads
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...(options.headers || {}) },
      signal: controller.signal,
      body: formData
    });
    
    clearTimeout(timeoutId);
    console.log('Multipart response status:', res.status);
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Upload failed ${res.status}: ${text}`);
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out after 60 seconds');
    }
    console.error('Multipart request error:', error);
    throw error;
  }
}

// Public API wrappers

export async function saveUser(user) {
  return requestJson('/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });
}

export async function sendRegistrationEmail(payload) {
  const form = new FormData();
  Object.entries(payload.fields || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  const files = payload.files || {};
  Object.entries(files).forEach(([key, file]) => {
    if (file && file.uri) {
      form.append(key, {
        uri: file.uri,
        name: file.name || `${key}.jpg`,
        type: file.type || 'image/jpeg'
      });
    }
  });
  return requestMultipart('/emails/registration', form);
}

export async function loginUser(credentials) {
  return requestJson('/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export async function getUserDives(idNumber) {
  const query = encodeURIComponent(String(idNumber || ''));
  return requestJson(`/dives?idNumber=${query}`, {
    method: 'GET'
  });
}

export async function createDive(payload) {
  return requestJson('/dives', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export const API_BASE_URL = BASE_URL;

export default {
  saveUser,
  sendRegistrationEmail,
  loginUser,
  getUserDives,
  createDive
};


