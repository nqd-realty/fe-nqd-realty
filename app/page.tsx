import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="NQD Realty Logo"
              width={180}
              height={60}
              className="h-12 w-auto object-contain bg-white/95 rounded-lg px-3 py-1"
              priority
            />
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-4">
            <a
              href="https://www.instagram.com/nqd.realty/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4af37] transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/nqd.realty"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4af37] transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@nqd.realty"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4af37] transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/917233072330"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4af37] transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="h-[calc(100vh-72px)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left Side - Hero & About */}
          <div className="bg-white flex flex-col justify-center px-8 lg:px-16 py-8">
            <div className="max-w-xl">
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1e3a5f] mb-4 leading-tight">
                Where Vision Meets
                <span className="block text-[#d4af37]">Value in Real Estate</span>
              </h1>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Premium real estate company based in <span className="font-semibold text-[#1e3a5f]">Jaipur, Rajasthan</span>,
                specializing in luxury housing, residential & commercial plots, real estate liaisoning,
                and turnkey construction projects.
              </p>

              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] text-white p-6 rounded-xl mb-6 shadow-lg">
                <p className="text-sm italic mb-3">
                  &quot;From dream homes to development-ready plots, regulatory approvals to complete build solutions —
                  we bring it all under one roof.&quot;
                </p>
                <div className="flex space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full mr-2"></div>
                    <span>Trust</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full mr-2"></div>
                    <span>Quality</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full mr-2"></div>
                    <span>Transparency</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/917233072330"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#d4af37] text-[#1e3a5f] rounded-lg font-semibold hover:bg-[#c99a2e] transition-colors shadow-md text-center"
                >
                  Contact Us Now
                </a>
                <a
                  href="mailto:contact@nqdrealty.com"
                  className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#2c5282] transition-colors shadow-md text-center"
                >
                  Send Email
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-[#1e3a5f]">Location:</span> Jaipur, Rajasthan
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-[#1e3a5f]">Phone:</span> +91 7233072330
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-[#1e3a5f]">Email:</span> contact@nqdrealty.com
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Services */}
          <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2c5282] to-[#1e3a5f] text-white flex flex-col justify-center px-8 lg:px-16 py-8">
            <div className="max-w-xl mx-auto w-full">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-8 text-center">
                <span className="text-[#d4af37]">Our</span> Services
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Service 1 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-[#d4af37]/20">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">Luxury Housing</h3>
                  <p className="text-sm text-gray-200">Premium residential properties with modern amenities</p>
                </div>

                {/* Service 2 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-[#d4af37]/20">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">Residential & Commercial Plots</h3>
                  <p className="text-sm text-gray-200">Prime location plots ready for development</p>
                </div>

                {/* Service 3 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-[#d4af37]/20">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">Real Estate Liaisoning</h3>
                  <p className="text-sm text-gray-200">Complete regulatory approvals & documentation</p>
                </div>

                {/* Service 4 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all border border-[#d4af37]/20">
                  <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">Turnkey Construction</h3>
                  <p className="text-sm text-gray-200">End-to-end construction with quality assurance</p>
                </div>
              </div>

              <div className="bg-[#d4af37]/20 backdrop-blur-sm rounded-xl p-6 border border-[#d4af37]/30">
                <p className="font-serif text-center text-lg font-semibold mb-3 text-[#d4af37]">
                  Building the Future, One Landmark at a Time
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-[#d4af37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Deep local market knowledge in Jaipur</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-[#d4af37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Complete end-to-end real estate solutions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-[#d4af37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Expert team with years of experience</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-[#d4af37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Commitment to quality and customer satisfaction</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="fixed bottom-0 w-full bg-[#1e3a5f] text-white py-2 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} NQD® Realty (OPC) Pvt Ltd. All rights reserved.</p>
      </div>
    </div>
  );
}
