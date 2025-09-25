'use client';

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Phone, Mail, MessageCircle, Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

const ContactSection = () => {
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
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const contacts = [
    {
      title: "WhatsApp",
      description: "Chat with us instantly on WhatsApp.",
      icon: MessageCircle,
      link: "https://wa.me/254796219542?text=Hello%20ACK%20St.%20Philip's%20Kihingo,%20I'd%20like%20to%20make%20an%20inquiry.",
    },
    {
      title: "Email",
      description: "Send us an email and we'll respond promptly.",
      icon: Mail,
      link: "mailto:info@kiambuack.org",
    },
    {
      title: "Direct Inquiries",
      description: "Call our office during working hours.",
      icon: Phone,
      link: "tel:+254700000000",
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      label: "Facebook"
    },
    {
      icon: Instagram,
      href: "#",
      label: "Instagram"
    },
    {
      icon: Youtube,
      href: "#",
      label: "YouTube"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-white to-blue-50">
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
              Get in Touch
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-light">
              We'd love to hear from you. Whether you have questions, prayer requests, or need information, feel free to contact us anytime.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contacts.map((contact, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition p-8 text-center group cursor-pointer"
              >
                <Link
                  href={contact.link}
                  target={contact.link.startsWith('http') ? "_blank" : undefined}
                  rel={contact.link.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-church-gold/10 flex items-center justify-center group-hover:bg-church-gold transition">
                    <contact.icon className="w-8 h-8 text-church-gold group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-church-navy mb-2">{contact.title}</h3>
                  <p className="text-gray-600 font-light">{contact.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Social Media */}
          <motion.div variants={itemVariants} className="text-center">
            <h3 className="text-2xl font-serif font-bold text-church-navy mb-6">Stay Connected</h3>
            <p className="text-gray-700 mb-6 font-light">Follow us on social media and subscribe to our updates.</p>
            <div className="flex justify-center space-x-6">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-church-navy to-blue-900 rounded-full hover:bg-church-gold transition"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6 text-white" />
                </Link>
              ))}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8"
            >
              <Link
                href="#contact"
                className="inline-block px-8 py-3 bg-church-gold text-white font-semibold rounded-full shadow-md hover:bg-yellow-600 transition"
                scroll={false}
              >
                Feel Free to Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;