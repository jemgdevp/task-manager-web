/**
 * @file src/stores/auth.js
 * @description This file defines the authentication store using Pinia. It manages the user's authentication state, including login, logout, and registration actions.
 * @author jemgdevp
 * @date 2026-03-26
 */

import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('/api/login', { email, password })
        this.user = response.data.user
        this.token = response.data.token
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        console.error('Login failed:', error)
      }
    },
    async register(name, email, password) {
      try {
        const response = await axios.post('/api/register', { name, email, password })
        this.user = response.data.user
        this.token = response.data.token
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        console.error('Registration failed:', error)
      }
    },
    logout() {
      this.user = null
      this.token = null
      delete axios.defaults.headers.common['Authorization']
    },
  },
})