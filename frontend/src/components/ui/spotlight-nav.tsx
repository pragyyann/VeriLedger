import React, { useState } from 'react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  indicatorPosition: number;
  position: number;
  accent?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  indicatorPosition,
  position,
  accent = false,
}) => {
  const distance = Math.abs(indicatorPosition - position);
  const spotlightOpacity = isActive ? 1 : Math.max(0, 1 - distance * 0.6);

  return (
    <button
      title={label}
      aria-label={label}
      className="relative flex flex-col items-center justify-center w-12 h-12 mx-2 transition-all duration-300 group"
      onClick={onClick}
    >
      {/* Spotlight beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-20 bg-gradient-to-b from-white/35 to-transparent blur-lg rounded-full pointer-events-none transition-opacity duration-400"
        style={{
          opacity: spotlightOpacity,
          transitionDelay: isActive ? '0.08s' : '0s',
        }}
      />
      {/* Icon */}
      <Icon
        className={`w-5 h-5 transition-all duration-200 ${
          isActive
            ? accent
              ? 'text-secondary drop-shadow-[0_0_6px_rgba(45,212,191,0.9)]'
              : 'text-white'
            : 'text-gray-500 group-hover:text-gray-300'
        }`}
        strokeWidth={isActive ? 2.5 : 2}
      />
    </button>
  );
};

interface SpotlightNavProps {
  items: {
    icon: React.ElementType;
    label: string;
    accent?: boolean;
    onClick?: () => void;
  }[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
}

export const SpotlightNav: React.FC<SpotlightNavProps> = ({ items, activeIndex, onIndexChange }) => {
  return (
    <nav className="relative flex items-center px-2 py-2 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
      {/* Active line indicator */}
      <div
        className="absolute top-0 h-[2px] bg-white transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full"
        style={{
          left: `${activeIndex * 64 + 8}px`,
          width: '48px',
          transform: 'translateY(-1px)',
        }}
      />
      {items.map((item, index) => (
        <NavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          isActive={activeIndex === index}
          indicatorPosition={activeIndex}
          position={index}
          accent={item.accent}
          onClick={() => {
            onIndexChange(index);
            item.onClick?.();
          }}
        />
      ))}
    </nav>
  );
};
