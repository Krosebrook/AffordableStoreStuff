import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatsCard } from "@/components/stats-card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 4000, orders: 240 },
  { month: "Feb", revenue: 3000, orders: 198 },
  { month: "Mar", revenue: 5000, orders: 320 },
  { month: "Apr", revenue: 4500, orders: 278 },
  { month: "May", revenue: 6000, orders: 389 },
  { month: "Jun", revenue: 5500, orders: 350 },
  { month: "Jul", revenue: 7000, orders: 420 },
];

const categoryData = [
  { name: "Electronics", value: 400, color: "#8B5CF6" },
  { name: "Clothing", value: 300, color: "#EC4899" },
  { name: "Home & Garden", value: 200, color: "#3B82F6" },
  { name: "Sports", value: 100, color: "#10B981" },
];

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", total: 129.99, status: "completed", time: "2 min ago" },
  { id: "ORD-002", customer: "Jane Smith", total: 89.50, status: "processing", time: "15 min ago" },
  { id: "ORD-003", customer: "Bob Wilson", total: 254.00, status: "pending", time: "1 hour ago" },
  { id: "ORD-004", customer: "Alice Brown", total: 45.99, status: "shipped", time: "3 hours ago" },
  { id: "ORD-005", customer: "Charlie Davis", total: 199.00, status: "completed", time: "5 hours ago" },
];

const topProducts = [
  { name: "Wireless Headphones Pro", sales: 234, revenue: 23400 },
  { name: "Smart Watch Series X", sales: 186, revenue: 37200 },
  { name: "Laptop Stand Deluxe", sales: 156, revenue: 7800 },
  { name: "USB-C Hub 7-in-1", sales: 142, revenue: 5680 },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass border-white/10">
            <Clock className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Link href="/products">
            <Button className="btn-gradient-sm" data-testid="button-add-product">
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          change={12.5}
          trend="up"
          icon={DollarSign}
          gradient="purple"
        />
        <StatsCard
          title="Total Orders"
          value="1,234"
          change={8.2}
          trend="up"
          icon={ShoppingCart}
          gradient="blue"
        />
        <StatsCard
          title="Products"
          value="156"
          change={-2.4}
          trend="down"
          icon={Package}
          gradient="pink"
        />
        <StatsCard
          title="Customers"
          value="892"
          change={18.7}
          trend="up"
          icon={Users}
          gradient="green"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
            <Badge variant="secondary" className="glass">
              <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
              +23.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-xs text-muted-foreground">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg glass"
                  data-testid={`order-row-${order.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-sm font-medium">{order.customer.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={`${statusColors[order.status]} border text-xs`}>
                      {order.status}
                    </Badge>
                    <span className="font-medium text-sm">${order.total.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Top Products</CardTitle>
            <Link href="/products">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="space-y-2" data-testid={`top-product-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    <span className="font-semibold gradient-text">
                      ${(product.revenue / 100).toFixed(0)}
                    </span>
                  </div>
                  <Progress
                    value={(product.sales / topProducts[0].sales) * 100}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
