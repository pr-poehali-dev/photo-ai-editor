const API_BASE = '';

export const api = {
  auth: {
    login: async (phone: string) => {
      const res = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', phone })
      });
      return res.json();
    },
    register: async (phone: string, firstName: string, lastName: string, isChild: boolean) => {
      const res = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', phone, firstName, lastName, isChild })
      });
      return res.json();
    }
  },
  users: {
    get: async (userId: number) => {
      const res = await fetch(`${API_BASE}/users?userId=${userId}`);
      return res.json();
    },
    updateProfile: async (userId: number, firstName: string, lastName: string, isChild: boolean) => {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', userId, firstName, lastName, isChild })
      });
      return res.json();
    },
    updateTheme: async (userId: number, theme: string) => {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_theme', userId, theme })
      });
      return res.json();
    },
    delete: async (userId: number) => {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return res.json();
    }
  },
  family: {
    getCode: async (userId: number) => {
      const res = await fetch(`${API_BASE}/family?userId=${userId}&action=get_code`);
      return res.json();
    },
    getChildren: async (userId: number) => {
      const res = await fetch(`${API_BASE}/family?userId=${userId}&action=get_children`);
      return res.json();
    },
    activateCode: async (parentId: number, familyCode: string) => {
      const res = await fetch(`${API_BASE}/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_code', parentId, familyCode })
      });
      return res.json();
    }
  },
  projects: {
    list: async (userId: number) => {
      const res = await fetch(`${API_BASE}/projects?userId=${userId}&action=list`);
      return res.json();
    },
    getChildrenProjects: async (userId: number) => {
      const res = await fetch(`${API_BASE}/projects?userId=${userId}&action=get_children_projects`);
      return res.json();
    },
    create: async (userId: number, title: string) => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', userId, title })
      });
      return res.json();
    },
    update: async (projectId: number, data: any) => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', projectId, ...data })
      });
      return res.json();
    }
  },
  upload: {
    photo: async (imageBase64: string, filename: string, contentType: string = 'image/png') => {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, filename, contentType })
      });
      return res.json();
    }
  }
};
