import React from 'react';

interface Props {
  size?: number;
  className?: string;
  showText?: boolean;
  asImg?: boolean;
  alt?: string;
}

export const DeoChhathSevaLogo: React.FC<Props> = ({
  size = 48,
  className = '',
  alt = 'DEO CHHATH SEVA - NEXTGEN DEVBHOOMI FOUNDATION',
}) => (
  <img
    src={size <= 80
      ? '/branding/deo-chhath-seva-icon-192.png'
      : '/branding/deo-chhath-seva-logo.png'}
    alt={alt}
    width={size}
    height={size}
    decoding="async"
    fetchPriority={size > 80 ? 'high' : 'auto'}
    className={`shrink-0 drop-shadow-sm select-none object-contain ${className}`}
  />
);

export const NextGenFoundationLogo = DeoChhathSevaLogo;
