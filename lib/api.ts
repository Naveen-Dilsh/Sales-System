// Base API URL - Make sure this points to your Express server
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Generic fetch function with error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`

  console.log(`Fetching from: ${url}`)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Get error message from the response body
      let errorMessage
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || `API error: ${response.status}`
      } catch (e) {
        errorMessage = `API error: ${response.status}`
      }

      throw new Error(errorMessage)
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return data || [] // Return empty array if data is null/undefined
    }

    return [] // Return empty array for non-JSON responses
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// Product API functions
export const productAPI = {
  getAll: () => fetchAPI("/products").catch(() => []),
  getBySupplier: (supplierId: number) => fetchAPI(`/products/supplier/${supplierId}`).catch(() => []),
  getAnalysis: (supplierId?: number) => {
    const endpoint = supplierId ? `/products/analysis?supplier_id=${supplierId}` : "/products/analysis"
    console.log(`Calling product analysis endpoint: ${endpoint}`)
    return fetchAPI(endpoint).catch(() => [])
  },
  create: (data: any) =>
    fetchAPI("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPriceHistory: () => fetchAPI("/products/price-history").catch(() => []),
}

// Export other API functions
export const agentAPI = {
  getAll: () => fetchAPI("/users/agents").catch(() => []),
  getById: (id: number) => fetchAPI(`/agents/${id}`),
  create: (data: any) =>
    fetchAPI("/users/agents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI(`/agents/${id}`, {
      method: "DELETE",
    }),
}

// Inventory API functions
export const inventoryAPI = {
  getAll: () => fetchAPI("/inventory").catch(() => []),
  getByAgent: (agentId: number) => fetchAPI(`/inventory/agent/${agentId}`).catch(() => []),
  getLowInventory: (threshold: number, agentId?: number) => {
    // Check if the server supports the agentId query parameter
    // If not, you might need to filter on the client side
    const endpoint = `/inventory/low/${threshold}`
    console.log(`Calling low inventory endpoint: ${endpoint}`)
    return fetchAPI(endpoint).catch(() => [])
  },
  restock: (data: { agent_id: number; product_id: number; quantity: number }) =>
    fetchAPI("/inventory/restock", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Order API functions
export const orderAPI = {
  getSummaries: (agentId?: number, salesRepId?: number) => {
    // Use a simple endpoint without query parameters if they're causing issues
    const endpoint = "/orders/summary"
    console.log(`Calling order summary endpoint: ${endpoint}`)
    return fetchAPI(endpoint)
      .then((data) => {
        console.log(`Received ${data.length} orders from API`)
        return data
      })
      .catch((error) => {
        console.error("Error fetching order summaries:", error)
        return []
      })
  },
  getByAgent: (agentId: number) => fetchAPI(`/orders/agent/${agentId}`).catch(() => []),
  getBySalesRep: (salesRepId: number) => fetchAPI(`/orders/sales-rep/${salesRepId}`).catch(() => []),
  getItems: (orderId: number) => fetchAPI(`/orders/${orderId}/items`).catch(() => []),
  create: (data: any) =>
    fetchAPI("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (orderId: number, status: string) =>
    fetchAPI(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}

// User API functions
export const userAPI = {
  getAgents: () => fetchAPI("/users/agents").catch(() => []),
  getSalesReps: () => fetchAPI("/users/sales-reps").catch(() => []),
  getSuppliers: () => fetchAPI("/users/suppliers").catch(() => []),
  getShopsBySalesRep: (salesRepId: number) => fetchAPI(`/users/shops/sales-rep/${salesRepId}`).catch(() => []),
  createAgent: (data: any) =>
    fetchAPI("/users/agents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createSalesRep: (data: any) =>
    fetchAPI("/users/sales-reps", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createShop: (data: any) =>
    fetchAPI("/users/shops", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Business Intelligence API functions
export const businessIntelligenceAPI = {
  // Products and Shops
  getProducts: () => fetchAPI("/products").catch(() => []),
  getShops: () => fetchAPI("/users/shops").catch(() => []),
  

  // Sales Forecasting
  // Update the getSalesForecast function in your API client
// getSalesForecast: (productId :number, intervalParam = '') => 
//   fetchAPI(`/bi/sales-forecast/${productId}${intervalParam}`).catch(() => []),

  generateSalesForecast: (productId: number) =>
    fetchAPI(`/bi/generate-sales-forecast/${productId}`, {
      method: "POST",
    }),

    // Sales Forecasting with interval parameter
  getSalesForecast: (productId: number, intervalParam = '') => 
    fetchAPI(`/bi/sales-forecast/${productId}${intervalParam}`).catch(() => []),

  // Market Basket Analysis
  getProductAssociations: () => fetchAPI("/bi/product-associations").catch(() => []),
  generateProductAssociations: (minSupport = 0.01, minConfidence = 0.2) =>
    fetchAPI("/bi/generate-product-associations", {
      method: "POST",
      body: JSON.stringify({ minSupport, minConfidence }),
    }),
  

  // Customer Segmentation
  getCustomerSegments: () => fetchAPI("/bi/customer-segments").catch(() => []),
  generateCustomerSegments: () =>
    fetchAPI("/bi/generate-customer-segments", {
      method: "POST",
    }),

  // Product Recommendations
  getProductRecommendations: (shopId: number) => fetchAPI(`/bi/product-recommendations/${shopId}`).catch(() => []),
  generateProductRecommendations: (shopId: number) =>
    fetchAPI(`/bi/generate-product-recommendations/${shopId}`, {
      method: "POST",
    }),
}
