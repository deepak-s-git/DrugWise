'use client';

import { FileText, Users, Shield, Scale, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="h-screen w-full bg-background pt-[100px] pb-[32px] px-[16px] md:px-[32px] overflow-hidden flex flex-col">
      <div className="max-w-[1280px] mx-auto w-full h-full flex flex-col space-y-[32px]">
        
        {/* Top Bar: Back Button & Header */}
        <div className="flex flex-col items-center relative shrink-0">
          <button 
            onClick={() => router.back()}
            className="absolute left-0 top-0 flex items-center gap-[8px] text-on-surface-variant hover:text-white hover:bg-secondary px-4 py-2 rounded-full transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold tracking-wide uppercase text-sm hidden md:inline">Back</span>
          </button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-[12px]"
          >
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20">
              <FileText size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Terms of Service
            </h1>
            <p className="text-base text-on-surface-variant">
              Rules and guidelines for accessing the DrugWise platform.
            </p>
          </motion.div>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-[24px] flex-1 min-h-0 max-w-[1200px] mx-auto w-full">
          
          {/* Card 1: Main Hero (Top Left - Horizontal 8 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.01, y: -4 }}
            className="md:col-span-8 md:row-span-1 bg-surface-container-lowest p-[32px] md:p-[40px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
            <div className="flex flex-col items-center gap-[12px] text-secondary">
              <FileText size={36} />
              <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Open Source Project</h2>
            </div>
            <p className="text-lg md:text-xl text-on-surface leading-relaxed font-medium max-w-[800px]">
              DrugWise is currently a passion project and open-source initiative. You are welcome to explore our normalized clinical data. We just ask that you <span className="font-bold text-secondary">use the data responsibly</span> and contribute back to the community where possible!
            </p>
          </motion.section>

          {/* Card 2: User Conduct (Top Right - Vertical 4 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="md:col-span-4 md:row-span-1 bg-surface-container-lowest p-[32px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
            <div className="flex flex-col items-center gap-[12px] text-secondary">
              <Users size={28} />
              <h2 className="text-xl md:text-2xl font-bold text-primary tracking-tight">Fair Use</h2>
            </div>
            <p className="text-base text-on-surface leading-relaxed font-medium">
              Please use this platform for educational and research purposes. Do not use this as a substitute for professional medical advice.
            </p>
          </motion.section>

          {/* Card 3: Limitations (Bottom Left - Vertical 4 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="md:col-span-4 md:row-span-1 bg-surface-container-lowest p-[32px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
            <div className="flex flex-col items-center gap-[12px] text-error">
              <Shield size={28} />
              <h2 className="text-xl md:text-2xl font-bold text-primary tracking-tight">Not Medical Advice</h2>
            </div>
            <p className="text-base text-on-surface leading-relaxed font-medium">
              DrugWise provides data "as-is" for informational purposes only. We are building this for the community, but always consult a doctor.
            </p>
          </motion.section>

          {/* Card 4: Governing Law (Bottom Right - Horizontal 8 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.01, y: -4 }}
            className="md:col-span-8 md:row-span-1 bg-surface-container-lowest p-[32px] md:p-[40px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
             <div className="flex flex-col items-center gap-[12px] text-secondary">
              <Scale size={36} />
              <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Community Driven</h2>
            </div>
            <p className="text-lg md:text-xl text-on-surface leading-relaxed font-medium max-w-[800px]">
              There are no strict corporate licenses here yet! We operate on trust, collaboration, and a shared goal of democratizing medical intelligence for everyone.
            </p>
          </motion.section>

        </div>

      </div>
    </div>
  );
}
