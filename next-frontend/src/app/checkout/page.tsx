/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function Checkout() {
  return (
    <main className="w-full max-w-7xl mx-auto pt-16 pb-24 px-6 md:px-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Review Cart</h1>
        <p className="text-on-surface-variant">3 items ready for checkout</p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Cart Item 1 */}
          <div className="glass-panel rounded-xl p-4 md:p-6 flex items-center gap-6 group hover:border-primary/30 transition-colors duration-300">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
              <img alt="Game cover" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3_eQ-g3IHqeT1h98WXtr0cgPCo85sWUwRTPLUFE-gTTCgNMUhpK0HGvqSDM6dYRua8ZJTxocSVo73e9hP4zPu5nkVjk1YVtSz9fEeXG881n1STePbU3yX_c4Gw54cUpOy6o4SHMaH_w5j3Ao9BL_KPVdMsyBJd6m0zg9ggmRxxJ0zL4TGyyGIl0JWpt-vA5KVBeczU67cWUAum2AQTcgEXe6tzZBdt2nJeoyhjvoN6QvB1C0deERxf-mdbbfXTTd4NdHYvoYWxk0" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-on-surface tracking-tight">NEON OVERDRIVE</h3>
                  <p className="text-primary text-sm font-semibold tracking-wider">ULTIMATE EDITION</p>
                </div>
                <button className="text-on-surface-variant hover:text-error transition-colors p-2 bg-white/5 rounded-full">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest">Digital Download</span>
                <span className="text-xl font-bold text-sky-300 tracking-tight">$59.99</span>
              </div>
            </div>
          </div>

          {/* Cart Item 2 */}
          <div className="glass-panel rounded-xl p-4 md:p-6 flex items-center gap-6 group hover:border-primary/30 transition-colors duration-300">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
              <img alt="Game cover" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkyk_pH_OhVOImwJRb3b5iJ1dtiP9Sb-FT4ewRCP3lUXNyEejjTH9MBCYwhX9Z2yd4R6o63xPJUs7bR_gvvSbXKr4YnRPMUP1h8YjvcAs5cLg-EEif69qyL609CgPSgtDsK8-VyJBXgY8n8ogkBIsgrYVoOdKNJwp2Z0zYneC0qttOviBkHqPNO6jbYHAU4fabZFgRq60_mkvDwSWf6PBB-t1ktEZI0iyJ4LDbPZnsiU_z9nl8H4vrrki7kNtwBojSWNhw8GpXJaI" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-on-surface tracking-tight">GLACIER ASCENT</h3>
                  <p className="text-tertiary text-sm font-semibold tracking-wider">PRE-ORDER BONUS</p>
                </div>
                <button className="text-on-surface-variant hover:text-error transition-colors p-2 bg-white/5 rounded-full">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest">Early Access Key</span>
                <span className="text-xl font-bold text-sky-300 tracking-tight">$44.50</span>
              </div>
            </div>
          </div>

          {/* Cart Item 3 */}
          <div className="glass-panel rounded-xl p-4 md:p-6 flex items-center gap-6 group hover:border-primary/30 transition-colors duration-300">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
              <img alt="Game cover" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGugK2sbdc8lK0RRrO13uiNFxK5kNMIPDFdBHuc3QRoByhjpR4A7aSMrV2Spf81OVL-kAqVB7UPsOPM_2ujB_wFwcFMX1MlYMMncE5Vxcxq97hTXOGWUgkj1s6tSUhMdUEuSGnYb1q6pt8sQtFWK1xxQKCKxQpAtkrIo7ia6qxwO-nalMcClmWwIaqeIixf8IDRxIlxbLZd39NGb1VrSTdo0oTVEjjx1XGFvUAfCJ_dYNP4iBIwZ4lqLudELCHRG7gjYGm6l_tVjQ" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-on-surface tracking-tight">VOID RUNNER</h3>
                  <p className="text-on-surface-variant text-sm font-semibold tracking-wider">STANDARD EDITION</p>
                </div>
                <button className="text-on-surface-variant hover:text-error transition-colors p-2 bg-white/5 rounded-full">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest">Steam Key</span>
                <span className="text-xl font-bold text-sky-300 tracking-tight">$29.99</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Checkout Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          <div className="glass-panel-elevated rounded-2xl p-8 shadow-[0_0_30px_rgba(125,211,252,0.05)]">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-surface">$134.48</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Tax</span>
                <span className="text-on-surface">$10.75</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Discount</span>
                <span className="text-tertiary">-$5.00</span>
              </div>
              <div className="pt-4 border-t border-sky-300/10 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-extrabold text-sky-300 tracking-tighter">$140.23</span>
              </div>
            </div>

            {/* Payment Method Placeholder */}
            <div className="mb-8 p-4 bg-primary-container/20 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                <span className="text-sm font-semibold uppercase tracking-wider">Payment Method</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface text-sm">•••• •••• •••• 4242</span>
                <button className="text-primary text-xs font-bold hover:underline">Edit</button>
              </div>
            </div>

            {/* Main CTA */}
            <button className="w-full bg-primary/20 border border-primary/40 hover:bg-primary/30 text-primary py-4 px-6 rounded-xl font-bold text-lg tracking-tight transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
              <span>Complete Purchase</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-center text-[10px] text-on-surface-variant/60 mt-6 leading-relaxed">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy. Your digital keys will be delivered instantly to your library.
            </p>
          </div>

          {/* Promotions / Coupon */}
          <div className="mt-6 glass-panel rounded-xl p-4 flex items-center justify-between border-dashed border-sky-300/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">confirmation_number</span>
              <span className="text-sm font-medium">Apply Promo Code</span>
            </div>
            <button className="text-sky-300 text-sm font-bold">Add</button>
          </div>
        </div>

      </div>
    </main>
  );
}
