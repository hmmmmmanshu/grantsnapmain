import React from 'react';
import { Star, Users, TrendingUp, Clock, DollarSign, Bot, Chrome, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const SocialProof = () => {
  const launchStats = [
    { icon: Users, value: "1,247+", label: "Waitlist Members" },
    { icon: Clock, value: "August 1, 2025", label: "Expected Launch" },
    { icon: TrendingUp, value: "50%", label: "Early Bird Discount" }
  ];

  const features = [
    {
      icon: DollarSign,
      title: "Skip Expensive Hiring",
      description: "Replace costly consultants ($2K-3K/month) and interns ($500-600/month) with AI automation that works 24/7.",
      benefits: [
        "Save $30K+ annually on hiring",
        "No training or management overhead", 
        "Instant availability and scaling"
      ]
    },
    {
      icon: Bot,
      title: "AI Copilot",
      description: "Analyzes applications, suggests strategic improvements, and ensures alignment with funder priorities - better than any consultant.",
      benefits: [
        "Smart application optimization",
        "Funder priority matching",
        "Strategic improvement suggestions"
      ]
    },
    {
      icon: Chrome,
      title: "Browser Extension",
      description: "Scans forms, VCs, and investor data to auto-fill applications, eliminating the need for research interns.",
      benefits: [
        "One-click form filling",
        "VC database integration",
        "Automated data entry"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const featureVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, -5, 5, 0],
      transition: {
        duration: 0.5,
        ease: [0.42, 0, 0.58, 1] as const
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const benefitVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    })
  };

  return (
    <div className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Launch Stats Section - with animations */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {launchStats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center p-4 sm:p-0 group"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 relative overflow-hidden"
                whileHover="hover"
                whileTap="tap"
                variants={iconVariants}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{
                    x: [-100, 100],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "linear"
                  }}
                />
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
              </motion.div>
              <motion.div 
                className="text-2xl sm:text-3xl font-bold text-black mb-1 sm:mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ 
                  delay: index * 0.2 + 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
                viewport={{ once: true }}
              >
                {stat.value}
              </motion.div>
              <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section - with enhanced animations */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 group hover:shadow-xl transition-all duration-500 relative overflow-hidden"
              variants={featureVariants}
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/30 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5 }}
              />
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gray-300 rounded-full opacity-30"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + i * 20}%`,
                    }}
                    animate={{
                      y: [-10, -20, -10],
                      x: [-5, 5, -5],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: [0.42, 0, 0.58, 1] as const,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>

              <motion.div 
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto relative z-10 group-hover:bg-gray-200 transition-colors duration-300"
                whileHover="hover"
                variants={iconVariants}
              >
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
              </motion.div>
              
              <motion.h3 
                className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 text-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {feature.title}
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 text-center leading-relaxed relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {feature.description}
              </motion.p>
              
              <div className="space-y-2 sm:space-y-3 relative z-10">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <motion.div 
                    key={benefitIndex} 
                    className="flex items-start space-x-2 sm:space-x-3"
                    custom={benefitIndex}
                    variants={benefitVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: index * 0.2 + benefitIndex * 0.1 + 0.6,
                        type: "spring",
                        stiffness: 200,
                        damping: 10
                      }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <span className="text-gray-700 text-xs sm:text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SocialProof;
