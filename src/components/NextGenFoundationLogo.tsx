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
 * Compatibility alias for the supplied DEO CHHATH SEVA logo.
 * The asset is the combined app/foundation lockup, not a standalone foundation mark.
 */
export const NextGenFoundationLogo: React.FC<Props> = (props) => {
  return <DeoChhathSevaLogo {...props} />;
};

export default NextGenFoundationLogo;
