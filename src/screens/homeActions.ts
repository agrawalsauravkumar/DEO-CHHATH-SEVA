import {
  Bell,
  CarFront,
  Droplets,
  HeartHandshake,
  HeartPulse,
  HelpCircle,
  MapPinned,
  Toilet,
  TrainFront,
  UsersRound,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { ScreenId } from '../types';

export const HOME_EMERGENCY_SCREEN: ScreenId = 'emergency';

export const HOME_PRIMARY_ACTIONS: {
  id: ScreenId;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  description: string;
  style: string;
}[] = [
  { id: 'map', icon: MapPinned, title: 'घाट एवं रास्ते', description: 'नक्शा और रास्ते देखें', style: 'home-service-card--blue' },
  { id: 'help', icon: HeartHandshake, title: 'सहायता केंद्र', description: 'मदद के विकल्प', style: 'home-service-card--green' },
  { id: 'parking', icon: CarFront, title: 'पार्किंग', description: 'सत्यापित पार्किंग जानकारी', style: 'home-service-card--gold' },
  { id: 'lost-found', icon: HelpCircle, title: 'खोया-पाया', description: 'सुरक्षित रिपोर्ट और सहायता', style: 'home-service-card--earth' },
  { id: 'family', icon: UsersRound, title: 'परिवार सुरक्षा', description: 'सुरक्षा सुविधा की स्थिति', style: 'home-service-card--gold' },
  { id: 'announcements', icon: Bell, title: 'घोषणाएँ', description: 'अधिकृत सार्वजनिक सूचनाएँ', style: 'home-service-card--orange' },
  { id: 'shuttle', icon: TrainFront, title: 'शटल सेवा', description: 'सत्यापित शटल जानकारी', style: 'home-service-card--blue' },
  { id: 'medical', icon: HeartPulse, title: 'चिकित्सा', description: 'चिकित्सा व प्राथमिक उपचार', style: 'home-service-card--green' },
  { id: 'toilet', icon: Toilet, title: 'शौचालय', description: 'सत्यापित सुविधा जानकारी', style: 'home-service-card--earth' },
  { id: 'water', icon: Droplets, title: 'पेयजल', description: 'सत्यापित पेयजल केंद्र', style: 'home-service-card--blue' },
];
