/**
 * @file src/stores/task.js
 * @description This file defines the task store using Pinia. It manages the user's task state, including creating, updating, and deleting tasks.
 * @author jemgdevp
 * @date 2026-03-26
 */

import { defineStore } from 'pinia'
import axios from 'axios'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
  }),
  actions: {
    async fetchTasks() {
      try {
        const response = await axios.get('/api/tasks')
        this.tasks = response.data
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    },
    async createTask(title, description) {
      try {
        const response = await axios.post('/api/tasks', { title, description })
        this.tasks.push(response.data)
      } catch (error) {
        console.error('Failed to create task:', error)
      }
    },
    async updateTask(id, title, description) {
      try {
        const response = await axios.put(`/api/tasks/${id}`, { title, description })
        const index = this.tasks.findIndex(task => task.id === id)
        if (index !== -1) {
          this.tasks[index] = response.data
        }
      } catch (error) {
        console.error('Failed to update task:', error)
      }
    },
    async deleteTask(id) {
      try {
        await axios.delete(`/api/tasks/${id}`)
        this.tasks = this.tasks.filter(task => task.id !== id)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    },
  },
})