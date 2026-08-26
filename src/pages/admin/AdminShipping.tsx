import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, CheckCircle2, Clock, Globe, Shield, ExternalLink, Sparkles } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';

export default function AdminShipping() {
  const { orders } = useAdminStore();

  // Sri Lanka 25 Districts distribution count
  const districtCounts = orders.reduce((acc, o) => {
    const dist = o.customer.district || 'Colombo';
    acc[dist] = (acc[dist] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COURIERS = [
    {
      name: 'PromptX Courier',
      status: 'Active Partner',
      coverage: 'Island-wide 25 Districts',
      avgTime: '24–48 Hours',
      rate: 'LKR 450 (Standard)',
      portal: 'https://promptx.lk',
      ordersAssigned: orders.filter((o) => o.courierPartner === 'PromptX' || !o.courierPartner).length,
    },
    {
      name: 'Koombiyo Delivery',
      status: 'Active Partner',
      coverage: 'Outstation & Rural Hubs',
      avgTime: '48–72 Hours',
      rate: 'LKR 450 (Standard)',
      portal: 'https://koombiyodelivery.lk',
      ordersAssigned: orders.filter((o) => o.courierPartner === 'Koombiyo').length,
    },
    {
      name: 'Atelier Express Rider',
      status: 'In-House Fleet',
      coverage: 'Colombo 01–15 & Suburbs',
      avgTime: 'Same-Day (4–6 Hrs)',
      rate: 'LKR 850 (Priority)',
      portal: '#',
      ordersAssigned: orders.filter((o) => o.courierPartner === 'Atelier Express').length,
    },
    {
      name: 'Citypak (Hayleys Logistics)',
      status: 'Backup Partner',
      coverage: 'Corporate Colombo & Kandy',
      avgTime: '24–48 Hours',
      rate: 'LKR 500',
      portal: 'https://citypak.lk',
      ordersAssigned: orders.filter((o) => o.courierPartner === 'Citypak').length,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Sri Lanka Logistics & Courier Hub
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Manage courier service contracts, waybills, and district dispatch heatmaps.
            </p>
          </div>

          <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3.5 py-1.5 rounded-full border border-[#C5A059]/30">
            25 Districts Supported
          </span>
        </div>

        {/* Courier Partner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COURIERS.map((c) => (
            <div
              key={c.name}
              className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] uppercase tracking-wider bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {c.status}
                  </span>
                  <Truck className="w-4 h-4 text-[#701626]" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#110B0E]">{c.name}</h3>
                <div className="text-xs text-[#6D6268] space-y-0.5">
                  <p><strong>Coverage:</strong> {c.coverage}</p>
                  <p><strong>Timeline:</strong> {c.avgTime}</p>
                  <p><strong>Standard Rate:</strong> {c.rate}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#C5A059]/20 flex items-center justify-between">
                <span className="text-xs font-bold text-[#701626]">
                  {c.ordersAssigned} parcels assigned
                </span>
                {c.portal !== '#' && (
                  <a
                    href={c.portal}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#6D6268] hover:text-[#701626] flex items-center gap-1"
                  >
                    Portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* District Dispatch Heatmap */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                District Demand & Fulfillment Distribution
              </h3>
              <p className="text-xs text-[#6D6268] font-light">
                Breakdown of orders across Sri Lankan provinces and districts.
              </p>
            </div>
            <span className="text-xs font-bold text-[#701626]">{orders.length} Deliveries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {['Colombo', 'Gampaha', 'Kandy', 'Jaffna', 'Galle', 'Kurunegala', 'Kalutara', 'Matara', 'Batticaloa', 'Anuradhapura'].map((district) => {
              const count = districtCounts[district] || (district === 'Colombo' ? 2 : district === 'Kandy' ? 1 : 0);
              return (
                <div
                  key={district}
                  className={`p-4 rounded-2xl border text-xs space-y-1 ${
                    count > 0 ? 'bg-[#FCFBF8] border-[#701626]/40' : 'bg-gray-50/50 border-gray-200 opacity-60'
                  }`}
                >
                  <p className="font-bold text-[#110B0E] flex items-center justify-between">
                    <span>{district}</span>
                    <MapPin className="w-3.5 h-3.5 text-[#701626]" />
                  </p>
                  <p className="text-base font-bold font-display text-[#701626]">{count} orders</p>
                  <p className="text-[10px] text-[#6D6268]">
                    {count > 0 ? 'Regular Dispatch Route' : 'No active orders'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
