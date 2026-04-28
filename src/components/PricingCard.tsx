'use client';

import React from 'react';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  onCtaClick: () => void;
  isPopular?: boolean;
  isPro?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  period,
  description,
  features,
  cta,
  onCtaClick,
  isPopular = false,
  isPro = false,
}) => {
  return (
    <motion.div
      whileHover={{ y: isPopular ? -8 : -4 }}
      className={`relative rounded-2xl transition-all duration-300 ${
        isPopular
          ? 'bg-gradient-to-br from-accent/15 to-accent/5 border-2 border-accent/40 shadow-2xl shadow-accent/20 scale-105'
          : 'bg-primary/50 border border-primary/30 hover:border-primary/60 shadow-lg shadow-black/10'
      }`}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 px-4 py-1 bg-accent rounded-full shadow-lg">
            <Star className="w-3 h-3 text-white fill-current" />
            <span className="text-xs font-bold text-white">Most Popular</span>
          </div>
        </div>
      )}

      <div className="p-8 sm:p-10 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-primary mb-2">{name}</h3>
          <p className="text-secondary text-sm mb-4">{description}</p>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-bold text-primary">${price}</span>
            <span className="text-secondary text-sm">{period}</span>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-8 flex-1">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isPopular ? 'text-accent' : 'text-accent/60'
                }`} />
                <span className="text-secondary text-sm leading-relaxed">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCtaClick}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
            isPopular
              ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/30 hover:shadow-accent/50'
              : 'border border-accent/40 text-accent hover:bg-accent/10 hover:border-accent/60'
          }`}
        >
          {cta}
        </motion.button>

        {isPro && (
          <p className="text-xs text-secondary/60 text-center mt-4">
            Billed monthly. Cancel anytime.
          </p>
        )}
      </div>
    </motion.div>
  );
};
