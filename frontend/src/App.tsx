import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BuyerPortal } from './components/BuyerPortal';
import { SellerPortal } from './components/SellerPortal';
import { PlatformPortal } from './components/PlatformPortal';
import { InvoiceProvider } from './context/InvoiceContext';

export function App() {
  return (
    <InvoiceProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    买家门户
                  </Link>
                  <Link
                    to="/seller"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    卖家门户
                  </Link>
                  <Link
                    to="/platform"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    平台门户
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<BuyerPortal />} />
                <Route path="/seller" element={<SellerPortal />} />
                <Route path="/platform" element={<PlatformPortal />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </InvoiceProvider>
  );
}

export default App;
