'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ExpansionMap from '@/components/ExpansionMap';

/**
 * Maps page — interactive location expansion map with viability scoring.
 * 
 * This is an alias for the Expansion feature. It displays the same
 * ExpansionMap component, allowing users to explore and compare
 * candidate locations across Canada.
 */
function ExpansionMapWithParams() {
  const searchParams = useSearchParams();
  const rentParam = searchParams.get('rent');
  const prefillRent = rentParam && !isNaN(Number(rentParam)) ? Number(rentParam) : null;
  return <ExpansionMap prefillRent={prefillRent} />;
}

export default function MapsPage() {
  return (
    <Suspense>
      <ExpansionMapWithParams />
    </Suspense>
  );
}
