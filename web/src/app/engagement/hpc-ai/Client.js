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
            <span className="inline-block mr-2">🖥️⚡</span>
            HPC-AI services
          </motion.h1>

          <motion.p
            className="text-gray-700 dark:text-gray-300"
            variants={itemVariants}
          >
            Servicii de calcul de înaltă performanță, training și suport pentru proiecte AI.
          </motion.p>
        </section>
      </motion.div>
    </main>
  );
}
