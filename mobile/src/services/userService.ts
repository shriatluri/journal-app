import apiClient from './api';
import { User, GrowthArea } from '../types';

interface GrowthAreasResponse {
  growthAreas: GrowthArea[];
}

export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async getGrowthAreas(): Promise<GrowthAreasResponse> {
    const response = await apiClient.get('/user/growth-areas');
    return response.data;
  },

  async updateGrowthAreas(
    growthAreas: { name: string; description: string }[]
  ): Promise<GrowthAreasResponse> {
    const response = await apiClient.post('/user/growth-areas', { growthAreas });
    return response.data;
  },

  async updateGrowthArea(
    areaId: string,
    updates: Partial<GrowthArea>
  ): Promise<{ growthArea: GrowthArea }> {
    const response = await apiClient.put(`/user/growth-areas/${areaId}`, updates);
    return response.data;
  },

  async deleteGrowthArea(areaId: string): Promise<void> {
    await apiClient.delete(`/user/growth-areas/${areaId}`);
  },
};
