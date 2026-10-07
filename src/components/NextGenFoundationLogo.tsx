/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DeoChhathSevaLogo } from './DeoChhathSevaLogo';

interface Props {
  size?: number;
  className?: string;
  showText?: boolean;
  asImg?: boolean;
}

/**
 * NEXTGEN DEVBHOOMI FOUNDATION - OFFICIAL DEO CHHATH SEVA EMBLEM
 * Re-exports the unified official Deo Chhath Seva logo.
 */
export const NextGenFoundationLogo: React.FC<Props> = (props) => {
  return <DeoChhathSevaLogo {...props} />;
};

export default NextGenFoundationLogo;
