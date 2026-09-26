
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Obtenemos el token
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const urlCompleta = `${import.meta.env.VITE_API_URL}${endpoint}`;
  
  const response = await fetch(urlCompleta, { ...options, headers });

  // 4. MAGIA GLOBAL: Si el token expiró o fue alterado, lo sacamos de la app
  if (response.status === 401) {
    alert("Tu sesión ha expirado por seguridad. Vuelve a iniciar sesión.");
    localStorage.clear();
    window.location.href = '../pages/login'; 
    throw new Error("Sesión expirada");
  }
  if(response.status === 403) {
    alert("No tienes permiso para acceder a esta recurso.");
    throw new Error("No tienes permiso");
  }

  // Si todo salió bien, devolvemos la respuesta normal
  return response;
};