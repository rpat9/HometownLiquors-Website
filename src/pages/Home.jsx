import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Wine, Truck, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="text-[var(--color-text-primary)] bg-[var(--color-bg)]">

      <section className="bg-[var(--card-bg)] py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to Hometown Liquors</h1>

          <p className="text-lg mb-6 text-[var(--color-muted)]">
            Braceville's trusted spot for wine, beer, and spirits.
          </p>

          <Link
            to="/products"
            className="btn-primary btn-hover px-6 py-3 text-lg rounded-lg inline-block"
          >
            Browse Products
          </Link>

        </motion.div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl font-bold mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          What We Offer
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Wine />, label: "Fine Wines" },
            { icon: <ShoppingBag />, label: "Premium Spirits" },
            { icon: <Truck />, label: "Easy Pickup" },
            { icon: <Clock />, label: "Extended Hours" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--color-border)] shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]">
                {item.icon}
              </div>

              <p className="font-semibold">{item.label}</p>

            </motion.div>
          ))}

        </div>
      </section>

      <section className="py-16 px-6 bg-[var(--card-bg)]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>
          <div className="space-y-8 text-left">
            {[
              {
                step: 1,
                text: "Scan the QR code in-store to browse live inventory.",
              },
              {
                step: 2,
                text: "Place your order and select a pickup time.",
              },
              {
                step: 3,
                text: "Show your ID at pickup to receive your items.",
              },
            ].map(({ step, text }, i) => (
              <motion.div
                key={step}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-lg">
                  {step}
                </div>
                <p className="text-lg">{text}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Locally Owned & Community Trusted
        </motion.h2>

        <motion.p
          className="text-lg text-[var(--color-muted)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          At Hometown Liquors, we pride ourselves on curated selections,
          friendly service, and a smooth in-store pickup experience. Whether
          you're celebrating, gifting, or relaxing — we’ve got the right bottle.
        </motion.p>

      </section>

      <footer className="bg-[var(--color-footer-bg)] text-[var(--color-text-secondary)] py-10 px-6 border-t border-[var(--color-border)]">

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Contact</h3>
            <p className="text-[var(--color-text-primary)]">103 Illinois 53, Illinois, USA</p>
            <p className="text-[var(--color-text-primary)]">contact@hometownliquors.com</p>
            <p className="text-[var(--color-text-primary)]">(224) 600-9754</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Hours</h3>
            <p className="text-[var(--color-text-primary)]">Mon–Sat: 8am – 9pm</p>
            <p className="text-[var(--color-text-primary)]">Sun: 8am - 6pm</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Quick Links</h3>
            <Link to="/login" className="text-[var(--color-text-primary)] block hover:underline">Login</Link>
            <Link to="/products" className="text-[var(--color-text-primary)] block hover:underline">Shop</Link>
            <Link to="/dashboard" className="text-[var(--color-text-primary)] block hover:underline">Dashboard</Link>
          </div>

        </div>

        <p className="text-center mt-10 text-xs text-[var(--color-text-primary)]">© {new Date().getFullYear()} Hometown Liquors. All rights reserved.</p>
      </footer>

    </div>
  );
}