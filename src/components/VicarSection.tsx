'use client';

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { User } from "lucide-react";
import Image from "next/image";

const VicarSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number] 
      },
    },
  };

  const currentVicars = [
    {
      name: "Rev. Edwin Njau",
      role: "Vicar",
      duration: "01-01-2025 – Present",
      image: "/images/Vicar.png",
      quote: "Leading our congregation with faith, compassion, and dedication.",
    },
    {
      name: "Ev. David Muchai",
      role: "Evangelist",
      duration: "Current",
      image: "/images/Ev. David.png",
      quote: "Spreading the Gospel and nurturing believers in Christ.",
    },
    {
      name: "Susan Gituku",
      role: "Lay Reader",
      duration: "Current",
      image: "/images/Lay.png",
      quote: "Serving faithfully in teaching, prayer, and ministry support.",
    },
  ];

  const pastVicars = [
    { name: "Rev. Wilson Kinuthia", duration: "02-10-2005 – 25-02-2007" },
    { name: "Rev. Dickson Gachugu", duration: "01-07-2007– 28-08-2008" },
    { name: "Rev. James Mwangi", duration: "01-03-2008 – 31-12-2010" },
    { name: "Rev. Lydia Nyambura", duration: "01-01-2011 – 01-01-2016" },
    { name: "Rev. Germano Kaburu", duration: "01-01-2016 – 31-12-2020" },
    { name: "Rev. James Njoka", duration: "01-01-2021 – _-08-2025" },
  ];

  return (
    <section id="vicars" className="py-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-church-navy mb-6">
              Our Current Leadership
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light">
              The ministry of St. Philip&apos;s Kihingo is guided by a dedicated
              team of leaders, shepherding the congregation with faith, vision,
              and service.
            </p>
          </motion.div>

          {/* Current Leaders */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {currentVicars.map((leader, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  {leader.image ? (
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover border-4 border-church-gold shadow-md"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-church-gold flex items-center justify-center border-4 border-church-gold shadow-md">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-church-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                    {leader.role}
                  </div>
                </div>
                <h4 className="text-xl font-serif font-bold text-church-navy">
                  {leader.name}
                </h4>
                <p className="mt-4 text-gray-600 italic font-light">“{leader.quote}”</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Past Vicars */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-serif font-bold text-church-navy mb-8 text-center">
              Past Vicars
            </h3>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x-0 md:divide-x divide-y md:divide-y-0 divide-gray-200">
                {pastVicars.map((vicar, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="group px-6 py-5 hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-medium text-church-navy group-hover:text-church-gold transition-colors">
                        {vicar.name}
                      </span>
                      <span className="text-sm text-church-navy font-semibold bg-church-gold px-3 py-1 rounded-full">
                        {vicar.duration}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Historical Note */}
            <motion.div
              variants={itemVariants}
              className="mt-12 text-center max-w-3xl mx-auto p-6 bg-church-gold/5 rounded-xl border border-church-gold/20"
            >
              <h4 className="text-lg font-serif font-semibold text-church-navy mb-2">
                Faithful Service Through The Years
              </h4>
              <p className="text-gray-600 font-light">
                Each vicar has uniquely contributed to the spiritual growth and
                community development of St. Philip&apos;s Kihingo, leaving a
                lasting legacy of faith and service.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VicarSection;