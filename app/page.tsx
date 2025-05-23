import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { RocketIcon, UsersIcon, PackageIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Header */}
      <header className="bg-gray-900 text-white relative">
        <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sales Management System</h1>
              <p className="mt-2 text-gray-300 max-w-md">Access powerful tools to manage your sales operations efficiently</p>
            </div>
            <div className="flex space-x-3">

              <Button size="sm" className="bg-gray-100 hover:bg-white text-gray-900">Get Started</Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Choose Your Portal</h2>
            <p className="mt-2 text-gray-600 max-w-lg mx-auto">Select the appropriate portal based on your role in the sales ecosystem</p>
          </div>
          
          {/* Portal Cards - Responsive grid with different layouts on different screen sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Agent Portal Card */}
            <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <div className="absolute top-0 right-0 p-4">
                <RocketIcon className="h-8 w-8 text-gray-400 opacity-20" />
              </div>
              <CardHeader className="pt-8 border-l-4 border-gray-800">
                <CardTitle className="text-xl text-gray-900">Agent Portal</CardTitle>
                <CardDescription className="text-gray-600">Manage inventory and create orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Access your comprehensive agent dashboard to manage inventory levels and create new orders for shops in your network.</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                  <span className="text-sm text-gray-700">Real-time inventory tracking</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                  <span className="text-sm text-gray-700">Streamlined order creation</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-8">
                <Link href="/login/agent" className="w-full">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    Login as Agent
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Sales Rep Portal Card */}
            <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <div className="absolute top-0 right-0 p-4">
                <UsersIcon className="h-8 w-8 text-gray-400 opacity-20" />
              </div>
              <CardHeader className="pt-8 border-l-4 border-gray-700">
                <CardTitle className="text-xl text-gray-900">Sales Rep Portal</CardTitle>
                <CardDescription className="text-gray-600">Track orders and manage territory</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Access your territory-specific dashboard to track order status and manage relationships with shops in your area.</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                  <span className="text-sm text-gray-700">Territory performance insights</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                  <span className="text-sm text-gray-700">Complete shop management</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-8">
                <Link href="/login/sales-rep" className="w-full">
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                    Login as Sales Rep
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Supplier Portal Card */}
            <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 p-4">
                <PackageIcon className="h-8 w-8 text-gray-400 opacity-20" />
              </div>
              <CardHeader className="pt-8 border-l-4 border-gray-600">
                <CardTitle className="text-xl text-gray-900">Supplier Portal</CardTitle>
                <CardDescription className="text-gray-600">Manage products and view analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Access your supplier dashboard to manage product catalog and monitor sales performance across all channels.</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  <span className="text-sm text-gray-700">Advanced sales analytics</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  <span className="text-sm text-gray-700">Inventory forecasting</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-8">
                <Link href="/login/supplier" className="w-full">
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                    Login as Supplier
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Features Section */}
          <div className="mt-16 md:mt-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Key Features</h2>
              <p className="mt-2 text-gray-600 max-w-lg mx-auto">Our platform offers powerful tools to streamline your sales operations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                <p className="text-gray-700">Get instant insights into your sales performance with detailed analytics dashboards.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Orders</h3>
                <p className="text-gray-700">Streamline your order process with our automated ordering system.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Access</h3>
                <p className="text-gray-700">Role-based access control ensures data security across your organization.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-bold text-lg mb-4">Sales Management System</h3>
              <p className="text-gray-300 max-w-md">Empowering businesses to optimize their sales operations and drive growth through our comprehensive management platform.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Features</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">&copy; 2025 Sales Management System. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}