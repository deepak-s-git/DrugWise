'use client';

import React from 'react';
import { motion } from 'motion/react';
import ShinyText from '@/components/ui/shiny-text';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShieldCheck, Database, ScanLine, Code, Globe2, Activity } from 'lucide-react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-background pt-[120px] pb-[80px] overflow-hidden">
      <div className="max-w-[1024px] mx-auto px-4 md:px-[32px] w-full">
        
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center mb-[80px] md:mb-[120px]"
        >
          <motion.div variants={itemVariants} className="inline-block mb-6 px-5 py-2 rounded-full border border-primary/20 bg-primary/5">
            <span className="text-label-lg font-bold tracking-widest uppercase text-primary">Our Mission</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-display-md md:text-display-lg font-bold text-on-surface mb-8 leading-tight">
            Democratizing <br className="hidden md:block" />
            <span className="text-secondary inline-block mt-2">
              <ShinyText text="Medical Intelligence" speed={3} className="text-secondary" />
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-title-lg text-on-surface-variant max-w-[700px] mx-auto leading-relaxed">
            DrugWise was built to bring transparency, accessibility, and verifiable truth to the Indian pharmaceutical ecosystem. No paywalls, no biases. Just pure data.
          </motion.p>
        </motion.section>

        {/* Bento Grid Features */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-[100px]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px]">
            
            {/* Feature 1: Large Card */}
            <motion.div variants={itemVariants} className="md:col-span-8">
              <SpotlightCard className="h-full p-8 md:p-10 flex flex-col justify-end bg-surface-container-low min-h-[340px]">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <Database className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-headline-md font-bold text-on-surface mb-3">Open-Source Database</h3>
                <p className="text-body-lg text-on-surface-variant max-w-[500px]">
                  Powered by a sprawling open-source dataset, DrugWise connects generic drugs, active ingredients, and branded alternatives in milliseconds.
                </p>
              </SpotlightCard>
            </motion.div>

            {/* Feature 2: Small Card */}
            <motion.div variants={itemVariants} className="md:col-span-4">
              <SpotlightCard className="h-full p-8 flex flex-col justify-end bg-surface-container-low min-h-[340px]">
                <div className="bg-secondary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <Activity className="text-secondary w-7 h-7" />
                </div>
                <h3 className="text-title-lg font-bold text-on-surface mb-2">Clinical Comparisons</h3>
                <p className="text-body-md text-on-surface-variant">
                  Instantly map interactions, strengths, and therapeutic classes side-by-side.
                </p>
              </SpotlightCard>
            </motion.div>

            {/* Feature 3: Small Card */}
            <motion.div variants={itemVariants} className="md:col-span-4">
              <SpotlightCard className="h-full p-8 flex flex-col justify-end bg-surface-container-low min-h-[340px]">
                <div className="bg-tertiary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <ScanLine className="text-tertiary w-7 h-7" />
                </div>
                <h3 className="text-title-lg font-bold text-on-surface mb-2">Blister Scanning</h3>
                <p className="text-body-md text-on-surface-variant">
                  Point your camera at any blister pack to instantly identify the drug using computer vision.
                </p>
              </SpotlightCard>
            </motion.div>

            {/* Feature 4: Large Card */}
            <motion.div variants={itemVariants} className="md:col-span-8">
              <SpotlightCard className="h-full p-8 md:p-10 flex flex-col justify-end bg-surface-container-low min-h-[340px] overflow-hidden relative group">
                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-x-1/4 translate-y-1/4 transition-transform duration-1000 group-hover:scale-110 group-hover:-rotate-3">
                  <Code className="w-[300px] h-[300px]" />
                </div>
                <div className="relative z-10">
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                    <ShieldCheck className="text-primary w-8 h-8" />
                  </div>
                  <h3 className="text-headline-md font-bold text-on-surface mb-3">Privacy First. Community Driven.</h3>
                  <p className="text-body-lg text-on-surface-variant max-w-[500px]">
                    No trackers. No advertisements. DrugWise is built to serve the public good. We believe medical knowledge should be a fundamental human right.
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Global Impact Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center bg-primary text-on-primary rounded-[32px] p-12 md:p-20 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <Globe2 className="w-[600px] h-[600px] animate-[spin_90s_linear_infinite]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-display-sm font-bold mb-6">Join the Movement</h2>
            <p className="text-title-lg opacity-90 max-w-[600px] mx-auto mb-10">
              Help us expand the largest open-source medical database in the world. Access the API, contribute to the dataset, or integrate our tools into your clinic.
            </p>
            <a 
              href="https://github.com/deepak-s-git/DrugWise" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block px-8 py-4 bg-surface text-primary rounded-full font-bold text-title-md hover:scale-105 hover:bg-secondary hover:text-on-secondary active:scale-95 transition-all duration-300 shadow-xl"
            >
              View Source Code
            </a>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
