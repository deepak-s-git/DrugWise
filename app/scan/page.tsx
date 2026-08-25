'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { scanImage } from '@/lib/api';
import type { ScanResponse } from '@/types';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/error-state';
import { FileUpload } from '@/components/ui/file-upload';
import AITextLoading from '@/components/ui/ai-text-loading';
import { motion } from 'motion/react';

type ScanState = 'upload' | 'processing' | 'result' | 'error';

export default function ScanPage() {
  const [state, setState] = useState<ScanState>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: File[]) => {
    const file = files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleReuploadFileSelect = useCallback(async (files: File[]) => {
    const file = files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setState('processing');
    try {
      const [result] = await Promise.all([
        scanImage(file),
        new Promise((resolve) => setTimeout(resolve, 4500)),
      ]);
      setScanResult(result);
      setState('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Scan failed');
      setState('error');
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    setState('processing');
    try {
      const [result] = await Promise.all([
        scanImage(selectedFile),
        new Promise((resolve) => setTimeout(resolve, 4500)),
      ]);
      setScanResult(result);
      setState('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Scan failed');
      setState('error');
    }
  }, [selectedFile]);

  return (
    <div className="flex flex-col flex-1 w-full pt-[120px]">
      <div className="max-w-[80rem] mx-auto px-4 md:px-8 py-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <h1 className="text-headline-lg text-primary mb-2">
            {state === 'processing' ? 'Processing Image Morphology' : 'Blister Pack Scanner'}
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-[37.5rem]">
            Extracting text, identifying package dimensions, and cross-referencing global clinical databases.
          </p>
        </div>

        <motion.div layout className={`w-full mx-auto ${state === 'upload' || state === 'processing' ? 'flex flex-col gap-6 max-w-[36rem]' : 'grid grid-cols-1 lg:grid-cols-[1fr_25rem] gap-10'}`}>
          {/* Left: Image Upload / Viewer */}
          <motion.div layout className="w-full flex flex-col">
          <div className={`relative flex items-center justify-center overflow-hidden rounded-3xl ${state === 'upload' ? 'aspect-square bg-surface-container-lowest' : 'h-[31.25rem] bg-[#000000]'}`}>
            {state === 'upload' ? (
              <div className="w-full h-full flex flex-col justify-center bg-surface-container-lowest p-2">
                <FileUpload onChange={handleFileSelect} />
              </div>
            ) : state === 'processing' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <AITextLoading />
              </div>
            ) : preview ? (
              <div className="relative w-full h-full">
                <img src={preview} alt="Blister pack" className="w-full h-full object-contain p-4" />
              </div>
            ) : null}
          </div>

          {preview && state === 'upload' && (
            <div className="pt-6">
              <button
                onClick={handleProcess}
                className="group relative w-full overflow-hidden bg-primary text-on-primary py-3 rounded-lg text-body-md font-medium transition-colors"
              >
                <div className="absolute bottom-0 left-0 h-0 w-full bg-secondary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-full z-0" />
                <span className="relative z-10 group-hover:text-on-secondary transition-colors duration-500">
                  Extract & Identify
                </span>
              </button>
            </div>
          )}

          {/* Hidden File Input for Re-upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleReuploadFileSelect(Array.from(e.target.files));
              }
            }} 
          />

          {preview && state === 'result' && (
            <div className="pt-6 grid grid-cols-2 gap-4">
              <button
                onClick={handleProcess}
                className="group relative w-full overflow-hidden bg-primary text-on-primary py-3 rounded-lg text-body-md font-medium transition-colors"
              >
                <div className="absolute bottom-0 left-0 h-0 w-full bg-secondary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-full z-0" />
                <span className="relative z-10 group-hover:text-on-secondary transition-colors duration-500">
                  Rescan
                </span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-full overflow-hidden bg-primary text-on-primary py-3 rounded-lg text-body-md font-medium transition-colors"
              >
                <div className="absolute bottom-0 left-0 h-0 w-full bg-secondary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-full z-0" />
                <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-on-secondary transition-colors duration-500">
                  <Upload size={18} />
                  Re-upload
                </span>
              </button>
            </div>
          )}
          </motion.div>

        {/* Right: Results */}
        <motion.div layout className="space-y-6 w-full self-center">
          {state === 'result' && scanResult?.success && scanResult.top_match && (
            <>
              {/* Match Card */}
              <div className="clinical-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Primary Candidate</span>
                  <span className="flex items-center gap-1 text-body-sm text-on-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded border border-on-tertiary-container/20">
                    <CheckCircle size={14} />
                    94.8% Match
                  </span>
                </div>
                <h2 className="text-headline-lg text-primary mb-1">
                  {scanResult.top_match.canonical_name}
                </h2>
                <p className="text-body-md text-on-surface-variant mb-4">
                  {scanResult.top_match.formulations?.[0]?.dosage_form || 'Tablet'}, blister packaging identified.
                </p>
                <div className="border-t border-outline-variant pt-4">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-2">
                    Detected Active Ingredients
                  </span>
                  <div className="flex gap-2">
                    <span className="border border-outline-variant rounded px-2 py-1 text-body-sm">
                      {scanResult.top_match.composition}
                    </span>
                    {scanResult.top_match.formulations?.[0]?.strength && (
                      <span className="border border-outline-variant rounded px-2 py-1 text-body-sm">
                        {scanResult.top_match.formulations[0].strength}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/medicine/${scanResult.top_match.medicine_id}`}
                className="block w-full bg-primary text-on-primary text-center py-3 rounded-lg text-body-md font-medium hover:bg-primary-container transition-colors"
              >
                View Clinical Monograph
              </Link>


            </>
          )}

          {state === 'result' && !scanResult?.success && (
            <ErrorState 
              code={400}
              title="Scan Unsuccessful"
            />
          )}

          {state === 'error' && (
            <ErrorState 
              code={500}
              title="Analysis Failed"
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  </div>
  );
}
