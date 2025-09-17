// API service for data fetching
const API_BASE_URL = '/api'

export class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  // Authentication
  async login(credentials: { username: string; password: string; rememberMe?: boolean }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async verifyToken(token: string) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  // Departments
  async getDepartments() {
    return this.request('/departments')
  }

  async getDepartment(id: number) {
    return this.request(`/departments/${id}`)
  }

  async getDepartmentParticipation(id: number) {
    return this.request(`/departments/${id}/participation`)
  }

  async getDepartmentResults(id: number) {
    return this.request(`/departments/${id}/results`)
  }

  // Arrondissements
  async getArrondissements(departmentId: number) {
    return this.request(`/departments/${departmentId}/arrondissements`)
  }

  async getArrondissement(id: number) {
    return this.request(`/arrondissements/${id}`)
  }

  // Bureau de Vote
  async getBureauVotes(arrondissementId: number) {
    return this.request(`/arrondissements/${arrondissementId}/bureau-votes`)
  }

  async getBureauVote(id: number) {
    return this.request(`/bureau-votes/${id}`)
  }

  // PV Documents
  async getPvs(departmentId: number, userId: number) {
    return this.request(`/departments/${departmentId}/pvs?userId=${userId}`)
  }

  async uploadPv(data: FormData) {
    const token = localStorage.getItem('authToken')
    
    const response = await fetch(`${API_BASE_URL}/pvs/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
    
    return response.json()
  }

  // Results
  async getResults(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request(`/results${queryParams ? `?${queryParams}` : ''}`)
  }

  async createResult(data: any) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateResult(id: number, data: any) {
    return this.request(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Participation
  async getParticipation(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request(`/participation${queryParams ? `?${queryParams}` : ''}`)
  }

  async createParticipation(data: any) {
    return this.request('/participation', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateParticipation(id: number, data: any) {
    return this.request(`/participation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  // Users
  async getUsers() {
    return this.request('/users')
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: number, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: number) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiService = new ApiService()