"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="relative"
        >
          <h1 className="text-[12rem] sm:text-[16rem] font-bold leading-none select-none">
            <span className="bg-gradient-to-b from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold-dark)] bg-clip-text text-transparent">
              4
            </span>
            <motion.span
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="inline-block bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent"
            >
              0
            </motion.span>
            <span className="bg-gradient-to-b from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold-dark)] bg-clip-text text-transparent">
              4
            </span>
          </h1>
          
          {/* Glowing effect behind */}
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-[var(--gold)] via-transparent to-[var(--gold)]" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
            Page Not Found
          </h2>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            Looks like this page went to the moon without us. 
            Let&apos;s get you back to trading.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[var(--background)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
          <Link
            href="/portfolio"
            className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--card)] transition-colors"
          >
            View Portfolio
          </Link>
        </motion.div>

        {/* Stock ticker animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 overflow-hidden"
        >
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex gap-8 text-sm text-[var(--muted)] whitespace-nowrap"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-8">
                <span>AAPLx <span className="text-green-500">↑</span></span>
                <span>TSLAx <span className="text-red-500">↓</span></span>
                <span>NVDAx <span className="text-green-500">↑</span></span>
                <span>MSFTx <span className="text-green-500">↑</span></span>
                <span>GOOGLx <span className="text-red-500">↓</span></span>
                <span>AMZNx <span className="text-green-500">↑</span></span>
                <span>METAx <span className="text-green-500">↑</span></span>
                <span>SPYx <span className="text-green-500">↑</span></span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

