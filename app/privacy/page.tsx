'use client';

import { ShieldCheck, EyeOff, Server, HardDrive, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function PrivacyPage() {
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
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Privacy Protocol
            </h1>
            <p className="text-base text-on-surface-variant">
              How DrugWise handles data, tracking, and your privacy.
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
            whileHover={{ scale: 1.02, y: -4 }}
            className="md:col-span-8 md:row-span-1 bg-surface-container-lowest p-[32px] md:p-[40px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
            <div className="flex flex-col items-center gap-[12px] text-secondary">
              <EyeOff size={36} />
              <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Zero Tracking</h2>
            </div>
            <p className="text-lg md:text-xl text-on-surface leading-relaxed font-medium max-w-[800px]">
              DrugWise is a stateless clinical reference platform. We do <span className="font-bold text-secondary">not track</span> your IP addresses, we do not log your search histories, and we do not require user accounts to access data.
            </p>
          </motion.section>

          {/* Card 2: Local Storage (Top Right - Vertical 4 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="md:col-span-4 md:row-span-1 bg-surface-container-lowest p-[32px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
            <div className="flex flex-col items-center gap-[12px] text-secondary">
              <HardDrive size={28} />
              <h2 className="text-xl md:text-2xl font-bold text-primary tracking-tight">Local Storage</h2>
            </div>
            <p className="text-base text-on-surface leading-relaxed font-medium">
              We exclusively use local browser storage for UI preferences. No invasive tracking cookies are sent to our servers.
            </p>
          </motion.section>

          {/* Card 3: Analytics (Bottom Left - Vertical 4 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="md:col-span-4 md:row-span-1 bg-surface-container-lowest p-[32px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
            <div className="flex flex-col items-center gap-[12px] text-secondary">
              <Server size={28} />
              <h2 className="text-xl md:text-2xl font-bold text-primary tracking-tight">Analytics</h2>
            </div>
            <p className="text-base text-on-surface leading-relaxed font-medium">
              We use open-source, anonymized analytics strictly to measure platform health. No personally identifiable information is ever collected.
            </p>
          </motion.section>

          {/* Card 4: Open Data (Bottom Right - Horizontal 8 col) */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="md:col-span-8 md:row-span-1 bg-surface-container-lowest p-[32px] md:p-[40px] rounded-3xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center gap-[16px] overflow-y-auto cursor-default"
          >
             <div className="flex flex-col items-center gap-[12px] text-secondary">
              <ShieldCheck size={36} />
              <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Data Security</h2>
            </div>
            <p className="text-lg md:text-xl text-on-surface leading-relaxed font-medium max-w-[800px]">
              Our infrastructure is built with security as a baseline. All clinical data is transferred over encrypted connections, ensuring your queries remain entirely private from end-to-end.
            </p>
          </motion.section>

        </div>

      </div>
    </div>
  );
}
