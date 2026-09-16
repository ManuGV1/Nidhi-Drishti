import React from 'react';
import { StatCard } from '../common/StatCard';
import { Building2, CheckCircle2, IndianRupee, ShieldAlert, MapPin, Landmark } from 'lucide-react';

export const KpiGrid = ({ overview }) => {
  if (!overview) return null;

  const formatINR = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Recommended Works"
        value={overview.total_recommended_works ? overview.total_recommended_works.toLocaleString('en-IN') : '0'}
        subtitle="MPLADS Master Allocation Dataset"
        icon={Building2}
        color="blue"
      />
      <StatCard
        title="Completed Works"
        value={overview.total_completed_works ? overview.total_completed_works.toLocaleString('en-IN') : '0'}
        subtitle="Verified Source Records"
        icon={CheckCircle2}
        color="emerald"
      />
      <StatCard
        title="Total Sanctioned Allocation"
        value={formatINR(overview.total_allocation_inr)}
        subtitle="Public Funds Allocated"
        icon={IndianRupee}
        color="amber"
      />
      <StatCard
        title="High Risk Indicators"
        value={overview.high_risk_count ? overview.high_risk_count.toLocaleString('en-IN') : '0'}
        subtitle="Prioritized for Manual Verification"
        icon={ShieldAlert}
        color="orange"
      />
    </div>
  );
};

export default KpiGrid;
