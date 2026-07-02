// ─── Organization Mock Data ───────────────────────────────────────

export const mockOrgProfile = {
  id: "org-001",
  name: "Acme Foods",
  address: "123 Main Street, San Francisco, CA 94105",
  stripeAccountId: "acct_1PkQ3F2eZvKYlo2C",
  createdAt: "2024-03-01",
  logoUrl: "",
  contactEmail: "hello@acmefoods.com",
  contactPhone: "+1 (415) 555-0192",
};

export const mockProducts = [
  { id: "p1", name: "Classic Burger", category: "Food", price: 12.99, stock: 48, tags: ["popular", "bestseller"], active: true },
  { id: "p2", name: "Caesar Salad", category: "Food", price: 9.99, stock: 32, tags: ["healthy"], active: true },
  { id: "p3", name: "Lemonade", category: "Drinks", price: 4.99, stock: 100, tags: ["summer"], active: true },
  { id: "p4", name: "Cheesecake Slice", category: "Desserts", price: 7.99, stock: 5, tags: ["sweet"], active: true },
  { id: "p5", name: "Veggie Wrap", category: "Food", price: 10.99, stock: 20, tags: ["healthy", "vegetarian"], active: true },
  { id: "p6", name: "Iced Coffee", category: "Drinks", price: 5.99, stock: 80, tags: ["coffee"], active: false },
  { id: "p7", name: "Club Sandwich", category: "Food", price: 11.49, stock: 0, tags: [], active: true },
  { id: "p8", name: "Mango Smoothie", category: "Drinks", price: 6.49, stock: 60, tags: ["summer", "healthy"], active: true },
];

export const mockExtras = [
  { id: "e1", name: "Bacon", category: "Toppings", price: 1.50 },
  { id: "e2", name: "Extra Cheese", category: "Toppings", price: 1.00 },
  { id: "e3", name: "Avocado", category: "Toppings", price: 2.00 },
  { id: "e4", name: "BBQ Sauce", category: "Sauces", price: 0.50 },
  { id: "e5", name: "Ranch Dressing", category: "Sauces", price: 0.50 },
  { id: "e6", name: "Sriracha", category: "Sauces", price: 0.50 },
  { id: "e7", name: "Small", category: "Size", price: -1.50 },
  { id: "e8", name: "Large", category: "Size", price: 2.00 },
];

export const mockIngredients = [
  { id: "i1", name: "Ground Beef", quantity: 12, unit: "kg", category: "Meat", lowStock: false },
  { id: "i2", name: "Lettuce", quantity: 3, unit: "heads", category: "Vegetables", lowStock: true },
  { id: "i3", name: "Tomato", quantity: 8, unit: "kg", category: "Vegetables", lowStock: false },
  { id: "i4", name: "Burger Buns", quantity: 80, unit: "units", category: "Bread", lowStock: false },
  { id: "i5", name: "Cheddar Cheese", quantity: 2, unit: "kg", category: "Dairy", lowStock: true },
  { id: "i6", name: "Chicken Breast", quantity: 9, unit: "kg", category: "Meat", lowStock: false },
  { id: "i7", name: "Olive Oil", quantity: 5, unit: "L", category: "Condiments", lowStock: false },
  { id: "i8", name: "Salt", quantity: 1, unit: "kg", category: "Condiments", lowStock: true },
];

export const mockTags = [
  { id: "t1", name: "Popular", color: "#2563eb", count: 5 },
  { id: "t2", name: "Healthy", color: "#16a34a", count: 3 },
  { id: "t3", name: "Bestseller", color: "#d97706", count: 2 },
  { id: "t4", name: "Vegetarian", color: "#65a30d", count: 4 },
  { id: "t5", name: "Summer", color: "#0891b2", count: 3 },
  { id: "t6", name: "Sweet", color: "#c026d3", count: 2 },
  { id: "t7", name: "Coffee", color: "#92400e", count: 1 },
  { id: "t8", name: "New", color: "#dc2626", count: 1 },
];

export const mockStockItems = [
  { id: "s1", productName: "Classic Burger", current: 48, minimum: 10, unit: "units", lowStock: false },
  { id: "s2", productName: "Caesar Salad", current: 32, minimum: 15, unit: "units", lowStock: false },
  { id: "s3", productName: "Cheesecake Slice", current: 5, minimum: 10, unit: "units", lowStock: true },
  { id: "s4", productName: "Club Sandwich", current: 0, minimum: 10, unit: "units", lowStock: true },
  { id: "s5", productName: "Veggie Wrap", current: 20, minimum: 10, unit: "units", lowStock: false },
  { id: "s6", productName: "Lemonade", current: 100, minimum: 20, unit: "units", lowStock: false },
  { id: "s7", productName: "Iced Coffee", current: 8, minimum: 15, unit: "units", lowStock: true },
];

export const mockOrders = [
  { id: "o1", number: "#1284", customer: "Alex Morgan", total: 28.97, status: "pending" as const, createdAt: "2026-05-28T10:30:00", items: 3 },
  { id: "o2", number: "#1283", customer: "Sam Chen", total: 15.50, status: "preparing" as const, createdAt: "2026-05-28T10:15:00", items: 2 },
  { id: "o3", number: "#1282", customer: "Maria García", total: 42.00, status: "ready" as const, createdAt: "2026-05-28T09:45:00", items: 4 },
  { id: "o4", number: "#1281", customer: "John Smith", total: 8.99, status: "delivered" as const, createdAt: "2026-05-28T09:00:00", items: 1 },
  { id: "o5", number: "#1280", customer: "Emma Wilson", total: 23.48, status: "cancelled" as const, createdAt: "2026-05-27T22:30:00", items: 2 },
  { id: "o6", number: "#1279", customer: "Carlos Ruiz", total: 35.96, status: "delivered" as const, createdAt: "2026-05-27T21:00:00", items: 4 },
  { id: "o7", number: "#1278", customer: "Lisa Park", total: 18.98, status: "delivered" as const, createdAt: "2026-05-27T20:15:00", items: 2 },
];

export const mockClients = [
  { id: "c1", name: "Alex Morgan", email: "alex@example.com", orders: 24, totalSpent: 348.76, lastOrder: "2026-05-28", loyaltyLevel: "gold" as const },
  { id: "c2", name: "Sam Chen", email: "sam@example.com", orders: 12, totalSpent: 187.50, lastOrder: "2026-05-28", loyaltyLevel: "silver" as const },
  { id: "c3", name: "Maria García", email: "maria@example.com", orders: 8, totalSpent: 105.00, lastOrder: "2026-05-28", loyaltyLevel: "bronze" as const },
  { id: "c4", name: "John Smith", email: "john@example.com", orders: 31, totalSpent: 521.34, lastOrder: "2026-05-28", loyaltyLevel: "gold" as const },
  { id: "c5", name: "Emma Wilson", email: "emma@example.com", orders: 5, totalSpent: 67.45, lastOrder: "2026-05-27", loyaltyLevel: "bronze" as const },
  { id: "c6", name: "Carlos Ruiz", email: "carlos@example.com", orders: 18, totalSpent: 298.90, lastOrder: "2026-05-27", loyaltyLevel: "silver" as const },
];

export const mockPaymentMethods = [
  { id: "pm1", name: "Cash", icon: "cash-outline", enabled: true, builtin: true },
  { id: "pm2", name: "Credit Card", icon: "card-outline", enabled: true, builtin: true },
  { id: "pm3", name: "Debit Card", icon: "card-outline", enabled: true, builtin: true },
  { id: "pm4", name: "Bank Transfer", icon: "swap-horizontal-outline", enabled: false, builtin: false },
  { id: "pm5", name: "Gift Card", icon: "gift-outline", enabled: true, builtin: false },
];

export const mockAnalytics = {
  revenueTotal: 12480.50,
  revenueChange: 12.4,
  ordersTotal: 384,
  ordersChange: 8.2,
  avgOrder: 32.50,
  avgOrderChange: 3.8,
  newClients: 28,
  clientsChange: -2.1,
  revenueByDay: [1420, 1680, 1340, 1890, 1560, 2100, 1490],
  ordersByDay: [42, 51, 38, 60, 47, 65, 44],
  topProducts: [
    { name: "Classic Burger", revenue: 2340, orders: 180 },
    { name: "Caesar Salad", revenue: 1180, orders: 118 },
    { name: "Cheesecake Slice", revenue: 960, orders: 120 },
    { name: "Lemonade", revenue: 748, orders: 150 },
    { name: "Veggie Wrap", revenue: 660, orders: 60 },
  ],
};
