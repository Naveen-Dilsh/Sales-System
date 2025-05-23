// This is a mock database service for demonstration purposes
// In a real application, you would use a proper database connection

// Type definitions based on your SQL schema
export interface Agent {
  agent_id: number
  name: string
  phone_no: string
  location: string
}

export interface Shop {
  shop_id: number
  name: string
  address: string
  phone_number: string
}

export interface Supplier {
  supplier_id: number
  name: string
  phone_number: string
  address: string
}

export interface SalesRep {
  sales_rep_id: number
  name: string
  territory: string
  phone_number: string
}

export interface Product {
  product_id: number
  supplier_id: number
  name: string
  description: string
  price: number
}

export interface Payment {
  payment_id: number
  payment_date: string
  method: string
  amount: number
}

export interface Order {
  order_id: number
  agent_id: number
  shop_id: number
  sales_rep_id: number
  payment_id: number
  status: string
}

export interface Inventory {
  inventory_id: number
  product_id: number
  agent_id: number
  quantity: number
  last_update_date: string
}

export interface OrderItem {
  order_id: number
  product_id: number
  quantity: number
  price: number
  order_date: string
}

export interface OrderSummary {
  order_id: number
  agent_name: string
  shop_name: string
  sales_rep_name: string
  payment_method: string
  payment_amount: number
  status: string
  total_items: number
  total_quantity: number
  total_order_value: number
  order_date: string
}

export interface ProductSalesAnalysis {
  product_id: number
  product_name: string
  supplier_name: string
  total_quantity_sold: number
  total_revenue: number
  number_of_orders: number
  number_of_shops: number
}

export interface LowInventoryProduct {
  product_id: number
  product_name: string
  quantity: number
  agent_name: string
  supplier_name: string
}

// Mock data based on your SQL inserts
const agents: Agent[] = [
  { agent_id: 1, name: "John Smith", phone_no: "555-123-4567", location: "New York" },
  { agent_id: 2, name: "Maria Garcia", phone_no: "555-234-5678", location: "Los Angeles" },
  { agent_id: 3, name: "David Johnson", phone_no: "555-345-6789", location: "Chicago" },
  { agent_id: 4, name: "Sarah Lee", phone_no: "555-456-7890", location: "Houston" },
  { agent_id: 5, name: "James Brown", phone_no: "555-567-8901", location: "Phoenix" },
]

const shops: Shop[] = [
  { shop_id: 1, name: "Downtown Mart", address: "123 Main St, New York, NY 10001", phone_number: "212-555-1234" },
  { shop_id: 2, name: "West Side Shop", address: "456 Ocean Ave, Los Angeles, CA 90001", phone_number: "213-555-2345" },
  {
    shop_id: 3,
    name: "Windy City Store",
    address: "789 Michigan Ave, Chicago, IL 60601",
    phone_number: "312-555-3456",
  },
  { shop_id: 4, name: "Gulf Coast Outlet", address: "101 Texas Blvd, Houston, TX 77001", phone_number: "713-555-4567" },
  { shop_id: 5, name: "Desert Trading Co", address: "202 Cactus Rd, Phoenix, AZ 85001", phone_number: "602-555-5678" },
]

const suppliers: Supplier[] = [
  {
    supplier_id: 1,
    name: "Global Goods Inc.",
    phone_number: "800-123-4567",
    address: "1000 Industry Pkwy, Detroit, MI 48201",
  },
  {
    supplier_id: 2,
    name: "Prime Products Ltd.",
    phone_number: "800-234-5678",
    address: "2000 Commerce Dr, Atlanta, GA 30301",
  },
  {
    supplier_id: 3,
    name: "Elite Supply Co.",
    phone_number: "800-345-6789",
    address: "3000 Business Rd, Boston, MA 02101",
  },
  {
    supplier_id: 4,
    name: "Quality Merchandise Corp.",
    phone_number: "800-456-7890",
    address: "4000 Trade Blvd, Seattle, WA 98101",
  },
  {
    supplier_id: 5,
    name: "Standard Distribution Inc.",
    phone_number: "800-567-8901",
    address: "5000 Logistics Ave, Miami, FL 33101",
  },
]

const salesReps: SalesRep[] = [
  { sales_rep_id: 1, name: "Alex Johnson", territory: "Northeast", phone_number: "888-111-2222" },
  { sales_rep_id: 2, name: "Sophia Martinez", territory: "West Coast", phone_number: "888-222-3333" },
  { sales_rep_id: 3, name: "Thomas Wilson", territory: "Midwest", phone_number: "888-333-4444" },
  { sales_rep_id: 4, name: "Olivia Thompson", territory: "South", phone_number: "888-444-5555" },
  { sales_rep_id: 5, name: "William Davis", territory: "Northwest", phone_number: "888-555-6666" },
]

const products: Product[] = [
  {
    product_id: 1,
    supplier_id: 1,
    name: "Premium Coffee Beans",
    description: "100% Arabica coffee beans from Colombia, medium roast",
    price: 12.99,
  },
  {
    product_id: 2,
    supplier_id: 2,
    name: "Organic Green Tea",
    description: "High-quality loose leaf green tea from Japan",
    price: 8.5,
  },
  {
    product_id: 3,
    supplier_id: 3,
    name: "Artisanal Chocolate Bar",
    description: "Dark chocolate with sea salt, 70% cacao",
    price: 4.99,
  },
  {
    product_id: 4,
    supplier_id: 4,
    name: "Gourmet Pasta",
    description: "Hand-crafted fettuccine from Italy",
    price: 6.75,
  },
  {
    product_id: 5,
    supplier_id: 5,
    name: "Extra Virgin Olive Oil",
    description: "Cold-pressed olive oil from Spain, 500ml bottle",
    price: 15.25,
  },
]

const inventory: Inventory[] = [
  { inventory_id: 1, product_id: 1, agent_id: 1, quantity: 250, last_update_date: "2025-05-01" },
  { inventory_id: 2, product_id: 2, agent_id: 2, quantity: 175, last_update_date: "2025-05-02" },
  { inventory_id: 3, product_id: 3, agent_id: 3, quantity: 120, last_update_date: "2025-05-03" },
  { inventory_id: 4, product_id: 4, agent_id: 4, quantity: 300, last_update_date: "2025-05-04" },
  { inventory_id: 5, product_id: 5, agent_id: 5, quantity: 85, last_update_date: "2025-05-05" },
]

const payments: Payment[] = [
  { payment_id: 1, payment_date: "2025-01-15", method: "Credit Card", amount: 250.75 },
  { payment_id: 2, payment_date: "2025-01-20", method: "Bank Transfer", amount: 500.0 },
  { payment_id: 3, payment_date: "2025-02-03", method: "PayPal", amount: 175.5 },
  { payment_id: 4, payment_date: "2025-02-14", method: "Credit Card", amount: 320.0 },
  { payment_id: 5, payment_date: "2025-03-01", method: "Check", amount: 450.25 },
]

const orders: Order[] = [
  { order_id: 1, agent_id: 1, shop_id: 3, sales_rep_id: 2, payment_id: 1, status: "Delivered" },
  { order_id: 2, agent_id: 2, shop_id: 5, sales_rep_id: 4, payment_id: 2, status: "Shipped" },
  { order_id: 3, agent_id: 3, shop_id: 1, sales_rep_id: 6, payment_id: 3, status: "Processing" },
  { order_id: 4, agent_id: 4, shop_id: 7, sales_rep_id: 8, payment_id: 4, status: "Delivered" },
  { order_id: 5, agent_id: 5, shop_id: 9, sales_rep_id: 10, payment_id: 5, status: "Cancelled" },
]

const orderItems: OrderItem[] = [
  { order_id: 1, product_id: 3, quantity: 5, price: 4.99, order_date: "2025-01-10" },
  { order_id: 1, product_id: 7, quantity: 3, price: 9.5, order_date: "2025-01-10" },
  { order_id: 2, product_id: 5, quantity: 2, price: 15.25, order_date: "2025-01-18" },
  { order_id: 2, product_id: 10, quantity: 4, price: 7.99, order_date: "2025-01-18" },
  { order_id: 3, product_id: 1, quantity: 10, price: 12.99, order_date: "2025-02-01" },
]

// Mock database functions
export const db = {
  // Agents
  getAgents: async (): Promise<Agent[]> => {
    return agents
  },
  getAgentById: async (id: number): Promise<Agent | undefined> => {
    return agents.find((a) => a.agent_id === id)
  },
  createAgent: async (agent: Omit<Agent, "agent_id">): Promise<Agent> => {
    const newAgent = {
      ...agent,
      agent_id: Math.max(...agents.map((a) => a.agent_id)) + 1,
    }
    agents.push(newAgent)
    return newAgent
  },

  // Shops
  getShops: async (): Promise<Shop[]> => {
    return shops
  },
  getShopById: async (id: number): Promise<Shop | undefined> => {
    return shops.find((s) => s.shop_id === id)
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    return suppliers
  },
  getSupplierById: async (id: number): Promise<Supplier | undefined> => {
    return suppliers.find((s) => s.supplier_id === id)
  },

  // Sales Reps
  getSalesReps: async (): Promise<SalesRep[]> => {
    return salesReps
  },
  getSalesRepById: async (id: number): Promise<SalesRep | undefined> => {
    return salesReps.find((s) => s.sales_rep_id === id)
  },
  createSalesRep: async (salesRep: Omit<SalesRep, "sales_rep_id">): Promise<SalesRep> => {
    const newSalesRep = {
      ...salesRep,
      sales_rep_id: Math.max(...salesReps.map((s) => s.sales_rep_id)) + 1,
    }
    salesReps.push(newSalesRep)
    return newSalesRep
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    return products
  },
  getProductById: async (id: number): Promise<Product | undefined> => {
    return products.find((p) => p.product_id === id)
  },
  getProductsBySupplier: async (supplierId: number): Promise<Product[]> => {
    return products.filter((p) => p.supplier_id === supplierId)
  },
  createProduct: async (product: Omit<Product, "product_id">): Promise<Product> => {
    const newProduct = {
      ...product,
      product_id: Math.max(...products.map((p) => p.product_id)) + 1,
    }
    products.push(newProduct)
    return newProduct
  },
  updateProduct: async (id: number, updates: Partial<Product>): Promise<Product | undefined> => {
    const index = products.findIndex((p) => p.product_id === id)
    if (index === -1) return undefined

    products[index] = { ...products[index], ...updates }
    return products[index]
  },

  // Inventory
  getInventory: async (): Promise<Inventory[]> => {
    return inventory
  },
  getInventoryByAgent: async (agentId: number): Promise<Inventory[]> => {
    return inventory.filter((i) => i.agent_id === agentId)
  },
  getInventoryByProduct: async (productId: number): Promise<Inventory[]> => {
    return inventory.filter((i) => i.product_id === productId)
  },
  updateInventory: async (inventoryId: number, quantity: number): Promise<Inventory | undefined> => {
    const index = inventory.findIndex((i) => i.inventory_id === inventoryId)
    if (index === -1) return undefined

    inventory[index] = {
      ...inventory[index],
      quantity,
      last_update_date: new Date().toISOString().split("T")[0],
    }
    return inventory[index]
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    return orders
  },
  getOrderById: async (id: number): Promise<Order | undefined> => {
    return orders.find((o) => o.order_id === id)
  },
  getOrdersByAgent: async (agentId: number): Promise<Order[]> => {
    return orders.filter((o) => o.agent_id === agentId)
  },
  getOrdersBySalesRep: async (salesRepId: number): Promise<Order[]> => {
    return orders.filter((o) => o.sales_rep_id === salesRepId)
  },
  createOrder: async (order: Omit<Order, "order_id">): Promise<Order> => {
    const newOrder = {
      ...order,
      order_id: Math.max(...orders.map((o) => o.order_id)) + 1,
    }
    orders.push(newOrder)
    return newOrder
  },
  updateOrderStatus: async (orderId: number, status: string): Promise<Order | undefined> => {
    const index = orders.findIndex((o) => o.order_id === orderId)
    if (index === -1) return undefined

    orders[index] = { ...orders[index], status }
    return orders[index]
  },

  // Order Items
  getOrderItems: async (orderId: number): Promise<OrderItem[]> => {
    return orderItems.filter((oi) => oi.order_id === orderId)
  },
  createOrderItem: async (orderItem: OrderItem): Promise<OrderItem> => {
    orderItems.push(orderItem)
    return orderItem
  },

  // Custom queries (based on your SQL functions and views)
  getLowInventoryProducts: async (threshold: number): Promise<LowInventoryProduct[]> => {
    const results: LowInventoryProduct[] = []

    for (const inv of inventory) {
      if (inv.quantity <= threshold) {
        const product = products.find((p) => p.product_id === inv.product_id)
        const agent = agents.find((a) => a.agent_id === inv.agent_id)
        const supplier = product ? suppliers.find((s) => s.supplier_id === product.supplier_id) : undefined

        if (product && agent && supplier) {
          results.push({
            product_id: product.product_id,
            product_name: product.name,
            quantity: inv.quantity,
            agent_name: agent.name,
            supplier_name: supplier.name,
          })
        }
      }
    }

    return results
  },

  getOrderSummaries: async (): Promise<OrderSummary[]> => {
    const results: OrderSummary[] = []

    for (const order of orders) {
      const agent = agents.find((a) => a.agent_id === order.agent_id)
      const shop = shops.find((s) => s.shop_id === order.shop_id)
      const salesRep = salesReps.find((s) => s.sales_rep_id === order.sales_rep_id)
      const payment = payments.find((p) => p.payment_id === order.payment_id)
      const items = orderItems.filter((oi) => oi.order_id === order.order_id)

      if (agent && shop && salesRep && payment && items.length > 0) {
        const totalItems = items.length
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalOrderValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
        const orderDate = items[0].order_date

        results.push({
          order_id: order.order_id,
          agent_name: agent.name,
          shop_name: shop.name,
          sales_rep_name: salesRep.name,
          payment_method: payment.method,
          payment_amount: payment.amount,
          status: order.status,
          total_items: totalItems,
          total_quantity: totalQuantity,
          total_order_value: totalOrderValue,
          order_date: orderDate,
        })
      }
    }

    return results
  },

  getProductSalesAnalysis: async (): Promise<ProductSalesAnalysis[]> => {
    const results: ProductSalesAnalysis[] = []
    const productMap = new Map<
      number,
      {
        product_id: number
        product_name: string
        supplier_name: string
        total_quantity_sold: number
        total_revenue: number
        orders: Set<number>
        shops: Set<number>
      }
    >()

    for (const item of orderItems) {
      const product = products.find((p) => p.product_id === item.product_id)
      const order = orders.find((o) => o.order_id === item.order_id)

      if (product && order && order.status !== "Cancelled") {
        const supplier = suppliers.find((s) => s.supplier_id === product.supplier_id)

        if (supplier) {
          if (!productMap.has(product.product_id)) {
            productMap.set(product.product_id, {
              product_id: product.product_id,
              product_name: product.name,
              supplier_name: supplier.name,
              total_quantity_sold: 0,
              total_revenue: 0,
              orders: new Set(),
              shops: new Set(),
            })
          }

          const data = productMap.get(product.product_id)!
          data.total_quantity_sold += item.quantity
          data.total_revenue += item.quantity * item.price
          data.orders.add(item.order_id)
          if (order.shop_id) data.shops.add(order.shop_id)
        }
      }
    }

    for (const [_, data] of productMap) {
      results.push({
        product_id: data.product_id,
        product_name: data.product_name,
        supplier_name: data.supplier_name,
        total_quantity_sold: data.total_quantity_sold,
        total_revenue: data.total_revenue,
        number_of_orders: data.orders.size,
        number_of_shops: data.shops.size,
      })
    }

    return results
  },

  // Stored procedure implementations
  restockInventory: async (
    agentId: number,
    productId: number,
    quantityToAdd: number,
  ): Promise<Inventory | undefined> => {
    const inventoryItem = inventory.find((i) => i.agent_id === agentId && i.product_id === productId)

    if (!inventoryItem) {
      // Create new inventory record
      const newInventory: Inventory = {
        inventory_id: Math.max(...inventory.map((i) => i.inventory_id)) + 1,
        product_id: productId,
        agent_id: agentId,
        quantity: quantityToAdd,
        last_update_date: new Date().toISOString().split("T")[0],
      }
      inventory.push(newInventory)
      return newInventory
    } else {
      // Update existing inventory
      inventoryItem.quantity += quantityToAdd
      inventoryItem.last_update_date = new Date().toISOString().split("T")[0]
      return inventoryItem
    }
  },

  processNewOrder: async (
    agentId: number,
    shopId: number,
    salesRepId: number,
    paymentMethod: string,
    paymentAmount: number,
    productIds: number[],
    quantities: number[],
    prices: number[],
    orderStatus = "Processing",
  ): Promise<{ orderId: number } | { error: string }> => {
    try {
      // Check inventory availability
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]
        const quantity = quantities[i]

        const inventoryItem = inventory.find((inv) => inv.product_id === productId && inv.agent_id === agentId)

        if (!inventoryItem || inventoryItem.quantity < quantity) {
          return { error: `Insufficient inventory for product ID ${productId}` }
        }
      }

      // Create payment
      const paymentId = Math.max(...payments.map((p) => p.payment_id)) + 1
      const newPayment: Payment = {
        payment_id: paymentId,
        payment_date: new Date().toISOString().split("T")[0],
        method: paymentMethod,
        amount: paymentAmount,
      }
      payments.push(newPayment)

      // Create order
      const orderId = Math.max(...orders.map((o) => o.order_id)) + 1
      const newOrder: Order = {
        order_id: orderId,
        agent_id: agentId,
        shop_id: shopId,
        sales_rep_id: salesRepId,
        payment_id: paymentId,
        status: orderStatus,
      }
      orders.push(newOrder)

      // Create order items and update inventory
      const orderDate = new Date().toISOString().split("T")[0]

      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]
        const quantity = quantities[i]
        const price = prices[i]

        // Create order item
        const newOrderItem: OrderItem = {
          order_id: orderId,
          product_id: productId,
          quantity,
          price,
          order_date: orderDate,
        }
        orderItems.push(newOrderItem)

        // Update inventory
        const inventoryItem = inventory.find((inv) => inv.product_id === productId && inv.agent_id === agentId)
        if (inventoryItem) {
          inventoryItem.quantity -= quantity
          inventoryItem.last_update_date = orderDate
        }
      }

      return { orderId }
    } catch (error) {
      return { error: "An error occurred while processing the order" }
    }
  },
}
