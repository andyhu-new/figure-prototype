import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, UserCircle, Users } from "lucide-react"
import BuyerPortal from './components/BuyerPortal'
import SellerPortal from './components/SellerPortal'
import PlatformPortal from './components/PlatformPortal'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Invoice Portal</h1>
              <div className="space-x-4">
                <Link to="/buyer">
                  <Button variant="ghost">
                    <UserCircle className="mr-2" />
                    Buyer
                  </Button>
                </Link>
                <Link to="/seller">
                  <Button variant="ghost">
                    <Building2 className="mr-2" />
                    Seller
                  </Button>
                </Link>
                <Link to="/platform">
                  <Button variant="ghost">
                    <Users className="mr-2" />
                    Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/buyer">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UserCircle className="mr-2" />
                        Buyer Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      Request and track invoices
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/seller">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="mr-2" />
                        Seller Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      Manage and upload invoices
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/platform">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2" />
                        Platform Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      Monitor invoice status
                    </CardContent>
                  </Card>
                </Link>
              </div>
            } />
            <Route path="/buyer" element={<BuyerPortal />} />
            <Route path="/seller" element={<SellerPortal />} />
            <Route path="/platform" element={<PlatformPortal />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
