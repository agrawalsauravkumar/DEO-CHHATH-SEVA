import { RouteResult } from '../types';
import { RouteRequestParams } from './RoutingProvider';

export const OfflineRouteService = {
  isConfigured: (): boolean => false,

  async calculateRoute(_params: RouteRequestParams): Promise<RouteResult> {
    throw new Error('ऑफलाइन रूटिंग अभी उपलब्ध नहीं है।');
  },
};
