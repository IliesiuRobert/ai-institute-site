"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.12 }
  },
};
const item = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Client() {
  return (
    <main className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
      <motion.div
        className="container max-w-6xl mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-6 md:p-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-900 dark:text-gray-100 tracking-tight"
          variants={item}
        >
          <span className="inline-block mr-2">📜</span>
          Procedures and Regulations
        </motion.h1>

        <motion.p className="text-gray-700 dark:text-gray-300" variants={item}>
          Content coming soon.
        </motion.p>
      </motion.div>
    </main>
  );
}
