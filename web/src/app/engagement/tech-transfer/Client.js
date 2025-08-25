"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Client() {
  return (
    <main className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
      <motion.div
        className="container max-w-6xl mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <section className="p-6 md:p-8">
          <motion.h1
            className="text-2xl md:text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100 tracking-tight"
            variants={itemVariants}
          >
            <span className="inline-block mr-2">🔁</span>
            Technology transfer & development unit
          </motion.h1>

          <motion.p
            className="text-gray-700 dark:text-gray-300 mb-6"
            variants={itemVariants}
          >
            Sprijinim transferul tehnologic: identificare IP, licențiere, prototipare, spin‑offs.
          </motion.p>

          <motion.div
            className="mt-2 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            variants={itemVariants}
          >
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <span className="inline-block mr-2">🧰</span>
                Servicii
              </h2>
            </div>
            <div className="px-4 md:px-6 py-6">
              <motion.ul
                className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.li variants={itemVariants}>Evaluare TRL & roadmap</motion.li>
                <motion.li variants={itemVariants}>Prototipare rapidă</motion.li>
                <motion.li variants={itemVariants}>Matchmaking cu industrie</motion.li>
              </motion.ul>
            </div>
          </motion.div>
        </section>
      </motion.div>
    </main>
  );
}
