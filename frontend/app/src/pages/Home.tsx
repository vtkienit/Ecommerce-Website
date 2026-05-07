import React, { useState, useEffect } from 'react';
import MainLayout from "../layouts/MainLayout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageProvider";
import { motion } from "framer-motion";
import { Timer, ShieldCheck, Truck, Award, ChevronRight } from 'lucide-react';
import Button from '../components/Button/Button';
import ProductCard from '../components/ProductCard';
import clsx from 'clsx';
import bannerImg from "../assets/images/home_banner.png";
import mattressImg from "../assets/images/mattress.png";
import beddingSetsImg from "../assets/images/bedding_sets.png";
import blanketsImg from "../assets/images/blankets.png";
import bedSheetsImg from "../assets/images/bed_sheets.png";
import pillowsImg from "../assets/images/pillows.png";
import useDragScroll from '../hooks/useDragScroll';

// Mock data remains similar but with more editorial properties
const flashSaleProducts = [
  {
    id: 1,
    title: 'Linen Duvet Set',
    price: 189.0,
    originalPrice: 270.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
    category: 'Linen Collection'
  },
  {
    id: 2,
    title: 'Bamboo Silk Pillowcase',
    price: 45.0,
    originalPrice: 65.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Silk Collection'
  },
  {
    id: 3,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600',
    category: 'Mattress Technology'
  },
  {
    id: 4,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: bannerImg,
    category: 'Mattress Technology'
  },
    {
    id: 5,
    title: 'Linen Duvet Set',
    price: 189.0,
    originalPrice: 270.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
    category: 'Linen Collection'
  },
  {
    id: 6,
    title: 'Bamboo Silk Pillowcase',
    price: 45.0,
    originalPrice: 65.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Silk Collection'
  },
  {
    id: 7,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600',
    category: 'Mattress Technology'
  },
];

const categories = [
  { id: 'mattress', name: 'Mattress', image: mattressImg },
  { id: 'beddingSets', name: 'Bedding Sets', image: beddingSetsImg },
  { id: 'blankets', name: 'Blankets', image: blanketsImg },
  { id: 'bedSheets', name: 'Bed Sheets', image:  bedSheetsImg},
  { id: 'pillows', name: 'Pillows', image: pillowsImg }
];

export default function Home() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState('02 : 45 : 12');
  const flashSaleSlider = useDragScroll();
  const collectionsSlider = useDragScroll();
  
  return (
    <MainLayout>
      <Helmet>
        <title>{t("home")}</title>
      </Helmet>

      {/* Hero Section - Mobile Focused Header, Large Desktop Presence */}
      <section className="relative w-full h-[400px] md:h-[430px] overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={bannerImg}
            className="w-full h-full object-cover brightness-[0.8]" 
            alt="Restorative Comfort"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 md:bg-black/20" />
        </div>
        
        <div className="relative z-10 h-full max-w-7xl mx-auto px-3 lg:px-8 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-semibold text-white tracking-tight mb-6">
              {t("slogan1")},<br />{t("slogan2")}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-md">
              {t('heroDesc')}
            </p>
            <Button size="lg" variant="primary" className="!font-semibold">
              {t('shopNow')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Flash Sale - Horizontal Scroll for Mobile */}
      <section className="py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        
            {/* Title */}
            <div>
              <span className="text-primary font-bold text-sm uppercase mb-2">
                {t('limitedTime')}
              </span>

              <h2 className="text-text text-2xl md:text-5xl font-semibold">
                {t('flashSale')}
              </h2>

              {/* Countdown - MOBILE */}
              <div className="flex items-center gap-2 mt-3 md:hidden">
                <Timer size={16} className="text-primary" strokeWidth={2.5} />
                <span className="text-base text-text-secondary">
                  {t('endsIn')}
                </span>
                <span className="text-base text-text font-mono font-semibold">
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Countdown - DESKTOP */}
            <div className="hidden md:flex items-center gap-3 text-sm bg-bg-secondary px-4 py-2 rounded-full border border-border">
              <Timer size={16} className="text-primary" strokeWidth={2.5} />
              <span className="text-text-secondary">
                {t('endsIn')}
              </span>
              <span className="text-text text-base font-mono font-semibold">
                {timeLeft}
              </span>
            </div>
          </div>
          
          <div className='flex justify-end mt-3 md:mt-5'>
            <Button className="!text-primary !font-semibold">
              {t("viewAll")} <ChevronRight size={15} />
            </Button>
          </div>

          <div
            ref={flashSaleSlider.sliderRef}
            {...flashSaleSlider.dragEvents}
            className="
              flex gap-3 lg:gap-5
              overflow-x-auto hide-scrollbar
              
              cursor-grab active:cursor-grabbing
              select-none
              touch-pan-y
              py-3
            "
          >
            {flashSaleProducts.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                className="w-[176px] lg:w-[240px] shrink-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Collections - Editorial Grid */}
      <section className="py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-3 lg:px-8">

          <h2 className="text-text text-2xl md:text-5xl font-semibold">{t('collections')}</h2>

          <div className='flex justify-end my-3 md:mt-5'>
            <Button className="!text-primary !font-semibold">
              {t("viewAll")} <ChevronRight size={15} />
            </Button>
          </div>
          
          <div 
            ref={collectionsSlider.sliderRef}
            {...collectionsSlider.dragEvents}
            className="flex gap-3 md:gap-5 overflow-x-auto hide-scrollbar pb-10 cursor-grab active:cursor-grabbing select-none touch-pan-y">
            {categories.map((cat) => (
              <div
                className="
                min-w-[200px] lg:min-w-[280px] relative group cursor-pointer bg-bg rounded-md overflow-hidden
                shadow-sm hover:shadow-lg transition-shadow duration-500
                ">
                <img 
                  src={cat.image} 
                  className="aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none" 
                  alt={cat.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end pb-5 pl-3">
                  <h3 className="text-white text-2xl font-semibold underline-offset-8 decoration-white/50 decoration-2 group-hover:underline">
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Restful Icons */}
      <section className="py-12 md:py-14 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <FeatureCard 
              icon={<Award className="text-primary/70" size={40} strokeWidth={1} />} 
              title={t('highQuality')} 
              desc={t('highQualityDesc')} 
            />
            <FeatureCard 
              icon={<Truck className="text-primary/70" size={40} strokeWidth={1} />} 
              title={t('fastDelivery')} 
              desc={t('fastDeliveryDesc')} 
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-primary/70" size={40} strokeWidth={1} />} 
              title={t('warranty')} 
              desc={t('warrantyDesc')} 
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full border border-border bg-bg flex items-center justify-center mb-5 shadow-sm hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h4 className="text-text text-2xl font-semibold mb-4 tracking-tight">{title}</h4>
      <p className="text-text-secondary text-base max-w-xs">{desc}</p>
    </div>
  );
}