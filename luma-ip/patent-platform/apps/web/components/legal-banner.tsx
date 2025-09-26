'use client';

import { AlertTriangle } from 'lucide-react';

export function LegalBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <p className="text-center text-sm font-medium text-amber-900">
          Important: This platform provides automated assistance only. Not legal advice. 
          Consult a registered patent practitioner before filing.
        </p>
      </div>
    </div>
  );
}