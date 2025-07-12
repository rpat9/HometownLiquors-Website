import { ShoppingBag, Wine, Truck, Clock, Star, MapPin, Phone, Mail, Award, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {

  const { currentUser } = useAuth();

  return (
    <div className="text-[var(--color-text-primary)] bg-[var(--color-bg)]">
      
      <section className="relative bg-[var(--color-primary)] py-24 px-6 text-center overflow-hidden">

        <div className="absolute inset-0 bg-black/20"></div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">

          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-6">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>Braceville's #1 Rated Liquor Store</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Welcome to
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Hometown Liquors
            </span>

          </h1>

          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Your trusted neighborhood destination for premium wines, craft beers, and fine spirits. 
            <span className="block mt-2 font-semibold">Serving Braceville with pride since day one.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-4 text-lg rounded-full bg-white text-[var(--color-primary)] font-semibold shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Browse Our Selection
            </Link>
            <a
              href="https://maps.google.com/?q=103+Illinois+53,+Braceville,+IL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-lg rounded-full border-2 border-white text-white hover:bg-white hover:text-[var(--color-primary)] font-semibold transition-all duration-300 text-center cursor-pointer"
            >
              Get Directions
            </a>
          </div>

        </div>

      </section>

      <section className="py-12 px-6 bg-[var(--card-bg)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <Award className="w-12 h-12" />, number: "1st", label: "Year Serving Braceville" },
              { icon: <Users className="w-12 h-12" />, number: "400+", label: "Happy Customers" },
              { icon: <Star className="w-12 h-12" />, number: "4.5", label: "Initial Rating" },
            ].map((item, index) => (
              <div key={item.label} className="flex flex-col items-center cursor-default">

                <div className="mb-3 text-[var(--color-primary)] flex items-center justify-center">
                  {item.icon}
                </div>

                <div className="text-3xl font-bold text-[var(--color-primary)] mb-1">
                  {item.number}
                </div>

                <div className="text-[var(--color-text-primary)] font-medium">
                  {item.label}
                </div>

              </div>
            ))}
          </div>

        </div>

      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Premium Selection & Service</h2>
          <p className="text-lg text-[var(--color-text-primary)] max-w-2xl mx-auto">
            From everyday favorites to special occasion bottles, we curate the finest selection for our community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <Wine className="w-16 h-16" />, 
              label: "Fine Wines", 
              description: "Curated selection from local vineyards to international classics"
            },
            { 
              icon: <ShoppingBag className="w-16 h-16" />, 
              label: "Premium Spirits", 
              description: "Top-shelf whiskeys, vodkas, and artisanal liqueurs"
            },
            { 
              icon: <Truck className="w-16 h-16" />, 
              label: "Easy Pickup", 
              description: "Order online, pick up in-store with dedicated parking"
            },
            { 
              icon: <Clock className="w-16 h-16" />, 
              label: "Extended Hours", 
              description: "Open 7 days a week with convenient evening hours"
            },
          ].map((item, index) => (

            <div
              key={item.label}
              className="group p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--color-border)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <div className="mx-auto mb-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                {item.icon}
              </div>

              <h3 className="font-bold text-lg mb-3 text-center">{item.label}</h3>
              <p className="text-[var(--color-text-primary)] text-sm leading-relaxed text-center">
                {item.description}
              </p>

            </div>
          ))}

        </div>
      </section>

      <section className="py-20 px-6 bg-[var(--card-bg)]">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple & Convenient</h2>
            <p className="text-lg text-[var(--color-text-primary)]">
              Skip the browsing and get exactly what you want with our streamlined process.
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: 1,
                title: "Scan & Browse",
                text: "Use the QR code in-store to access our live inventory and browse available products on your phone.",
                icon: <Phone className="w-6 h-6" />
              },
              {
                step: 2,
                title: "Order & Schedule",
                text: "Add items to your cart and select a convenient pickup time that works with your schedule.",
                icon: <Calendar className="w-6 h-6" />
              },
              {
                step: 3,
                title: "Show ID & Collect",
                text: "Present your valid ID at pickup and collect your order from our dedicated pickup area.",
                icon: <Award className="w-6 h-6" />
              },
            ].map(({ step, title, text, icon }, i) => (

              <div
                key={step}
                className="flex items-start gap-6 p-6 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] cursor-default"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-xl shadow-lg">
                  {step}
                </div>

                <div className="flex-1">

                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-[var(--color-primary)] flex items-center justify-center">{icon}</div>
                    <h3 className="text-xl font-bold">{title}</h3>
                  </div>

                  <p className="text-[var(--color-text-primary)] leading-relaxed">{text}</p>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Locally Owned & Community Trusted
            </h2>
            <p className="text-lg text-[var(--color-text-primary)] mb-6 leading-relaxed">
              At Hometown Liquors, we're more than just a store – we're your neighbors. 
              Our carefully curated selection, knowledgeable owners, and commitment to 
              exceptional service have made us Braceville's go-to destination for all 
              your beverage needs.
            </p>
            <p className="text-lg text-[var(--color-text-primary)] leading-relaxed">
              Whether you're celebrating a special occasion, hosting friends, or simply 
              unwinding after a long day, we're here to help you find the perfect bottle.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center cursor-default">
              <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">500+</div>
              <div className="text-sm text-[var(--color-text-primary)]">Wine Varieties</div>
            </div>

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center cursor-default">
              <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">100+</div>
              <div className="text-sm text-[var(--color-text-primary)]">Craft Beers</div>
            </div>

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center cursor-default">
              <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">200+</div>
              <div className="text-sm text-[var(--color-text-primary)]">Premium Spirits</div>
            </div>

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center cursor-default">
              <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">A+</div>
              <div className="text-sm text-[var(--color-text-primary)]">Customer Service</div>
            </div>

          </div>

        </div>
      </section>
      
      <footer className="bg-[var(--card-bg)] text-[var(--color-text-secondary)] py-12 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            <div>
              <h3 className="font-bold mb-4 text-[var(--color-primary)] text-lg">Contact Info</h3>

              <div className="space-y-3 text-[var(--color-text-primary)]">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                  <p className="text-sm">103 Illinois 53, Braceville, IL</p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                  <p className="text-sm">(224) 600-9754</p>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                  <p className="text-sm">hometown53route@gmail.com</p>
                </div>

              </div>

            </div>

            <div>
              <h3 className="font-bold mb-4 text-[var(--color-primary)] text-lg">Store Hours</h3>
              <div className="space-y-2 text-sm text-[var(--color-text-primary)]">
                <p>Monday - Thursday: 8am - 9pm</p>
                <p>Friday - Saturday: 8am - 9:30pm</p>
                <p>Sunday: 8am - 6pm</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-[var(--color-primary)] text-lg">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link 
                  to="/products"
                  className="block text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors text-left cursor-pointer"
                >
                  Shop Products
                </Link>

                <Link 
                  to="/dashboard"
                  className="block text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors text-left cursor-pointer"
                >
                  Dashboard
                </Link>

                {currentUser ? (
                  <Link 
                  to="/dashboard"
                  className="block text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors text-left cursor-pointer"
                  >
                    Your Cart
                  </Link>
                ) : (
                  <Link 
                  to="/login"
                  className="block text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors text-left cursor-pointer"
                  >
                    Account Login
                  </Link>
                )}

              </div>
            </div>

            <div>

              <h3 className="font-bold mb-4 text-[var(--color-primary)] text-lg">About</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
                Proudly serving Braceville and surrounding communities with premium 
                beverages and exceptional service since our founding.
              </p>

            </div>

          </div>

          <div className="border-t border-[var(--color-border)] pt-8 text-center">

            <p className="text-sm text-[var(--color-text-primary)]">
              © {new Date().getFullYear()} Hometown Liquors. All rights reserved. | 
              <span className="ml-2">Drink Responsibly. Must be 21+</span>
            </p>

          </div>

        </div>

      </footer>
    </div>
  )
  
}