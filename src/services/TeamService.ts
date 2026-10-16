import { apiUrl } from './apiUrl';
import { apiBlobRequest, apiRequest } from './apiClient';

export interface TeamMember {
  id: string;
  fullName: string;
  designation: string;
  isDemo: boolean;
  isPublished?: boolean;
  hasPhoto?: boolean;
  photoPermissionConfirmed?: boolean;
  photoUrl: string;
  adminPhotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TeamMembersResponse {
  members: TeamMember[];
  containsDemo?: boolean;
}

interface TeamMemberResponse {
  success: boolean;
  member: TeamMember;
  warning?: string;
}

const TEAM_STORAGE_KEY = 'deo_team_members_store_v1';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function makeSvgAvatar(initials: string, titleShort: string, primaryColor: string, secondaryColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="g_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g_${initials})"/>
  <circle cx="200" cy="175" r="90" fill="#FFF7E5" opacity="0.95"/>
  <circle cx="200" cy="175" r="80" fill="${secondaryColor}" opacity="0.12"/>
  <text x="200" y="193" font-family="'Mukta', sans-serif, system-ui" font-size="44" font-weight="900" fill="${secondaryColor}" text-anchor="middle">${initials}</text>
  <path d="M70 440 C70 295, 330 295, 330 440 Z" fill="#FFF7E5" opacity="0.95"/>
  <path d="M95 440 C95 320, 305 320, 305 440 Z" fill="${secondaryColor}" opacity="0.18"/>
  <rect x="25" y="435" width="350" height="45" rx="14" fill="${secondaryColor}" opacity="0.9"/>
  <text x="200" y="463" font-family="'Mukta', sans-serif, system-ui" font-size="16" font-weight="bold" fill="#FFB52E" text-anchor="middle">${titleShort}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'demo-member-1',
    fullName: 'सौरव कुमार (Saurav Kumar)',
    designation: 'मुख्य संयोजक एवं संस्थापक',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('सौरव', 'मुख्य संयोजक', '#0C4A6E', '#063B5C'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-2',
    fullName: 'राहुल कुमार (Rahul Kumar)',
    designation: 'उप-संयोजक एवं संचालन प्रमुख',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('राहुल', 'संचालन प्रमुख', '#1E3A8A', '#1E40AF'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-3',
    fullName: 'प्रिया कुमारी (Priya Kumari)',
    designation: 'महिला एवं बाल सहायता प्रमुख',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('प्रिया', 'महिला/बाल सुरक्षा', '#991B1B', '#7F1D1D'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-4',
    fullName: 'अमित कुमार शर्मा (Amit Sharma)',
    designation: 'तकनीकी एवं डिजिटल सेवा प्रमुख',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('अमित', 'IT/डिजिटल सेवा', '#0E7490', '#155E75'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-5',
    fullName: 'विकास कुमार सिंह (Vikash Singh)',
    designation: 'सूर्य कुंड एवं घाट प्रबंधन प्रभारी',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('विकास', 'घाट प्रबंधन', '#9A3412', '#7C2D12'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-6',
    fullName: 'पूजा वर्मा (Pooja Verma)',
    designation: 'स्वयंसेवक समन्वयिका एवं स्वास्थ्य डेस्क',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('पूजा', 'स्वयंसेवक प्रमुख', '#166534', '#14532D'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
];

function loadLocalTeam(): TeamMember[] {
  if (!isBrowser) return [...DEFAULT_DEMO_TEAM_MEMBERS];
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_TEAM_MEMBERS));
      return [...DEFAULT_DEMO_TEAM_MEMBERS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [...DEFAULT_DEMO_TEAM_MEMBERS];
  } catch {
    return [...DEFAULT_DEMO_TEAM_MEMBERS];
  }
}

function saveLocalTeam(members: TeamMember[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save team members locally:', err);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('फोटो लोड करने में असमर्थ।'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  if (dataUrl.startsWith('data:image/svg+xml')) {
    const parts = dataUrl.split(',');
    const decoded = decodeURIComponent(parts[1] || '');
    return new Blob([decoded], { type: 'image/svg+xml' });
  }
  const parts = dataUrl.split(';base64,');
  if (parts.length === 2) {
    const contentType = parts[0].split(':')[1] || 'image/jpeg';
    const raw = typeof window !== 'undefined' ? window.atob(parts[1]) : '';
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }
  return new Blob([dataUrl], { type: 'image/svg+xml' });
}

export const TeamService = {
  async getPublicMembers(): Promise<TeamMembersResponse> {
    try {
      const result = await apiRequest<TeamMembersResponse>('/api/team');
      if (result && Array.isArray(result.members) && result.members.length > 0) {
        return result;
      }
    } catch {
      // Backend not running or offline; proceed to local store
    }

    const all = loadLocalTeam();
    const published = all.filter((m) => m.isPublished !== false);
    return {
      members: published,
      containsDemo: published.some((m) => m.isDemo),
    };
  },

  async getAdminMembers(): Promise<{ members: TeamMember[] }> {
    try {
      const result = await apiRequest<{ members: TeamMember[] }>('/api/team/admin', {}, true);
      if (result && Array.isArray(result.members) && result.members.length > 0) {
        return result;
      }
    } catch {
      // Backend not running or demo mode; proceed to local store
    }

    const members = loadLocalTeam();
    return { members };
  },

  async createMember(fields: { fullName: string; designation: string }): Promise<TeamMemberResponse> {
    try {
      const result = await apiRequest<TeamMemberResponse>('/api/team/admin', {
        method: 'POST',
        body: JSON.stringify(fields),
      }, true);
      if (result?.member) {
        return result;
      }
    } catch {
      // Fallback to local store
    }

    const members = loadLocalTeam();
    const newMember: TeamMember = {
      id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fullName: fields.fullName.trim(),
      designation: fields.designation.trim(),
      isDemo: false,
      isPublished: false,
      hasPhoto: false,
      photoPermissionConfirmed: false,
      photoUrl: '/team-placeholder.svg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    members.unshift(newMember);
    saveLocalTeam(members);
    return { success: true, member: newMember };
  },

  async updateMember(
    id: string,
    fields: { fullName: string; designation: string; isDemo: boolean }
  ): Promise<TeamMemberResponse> {
    try {
      const result = await apiRequest<TeamMemberResponse>(`/api/team/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fields),
      }, true);
      if (result?.member) {
        return result;
      }
    } catch {
      // Fallback to local store
    }

    const members = loadLocalTeam();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error('टीम सदस्य नहीं मिला।');
    }
    const updated: TeamMember = {
      ...members[index],
      fullName: fields.fullName.trim(),
      designation: fields.designation.trim(),
      isDemo: fields.isDemo,
      updatedAt: new Date().toISOString(),
    };
    members[index] = updated;
    saveLocalTeam(members);
    return { success: true, member: updated };
  },

  async uploadPhoto(
    id: string,
    photo: File,
    permissionConfirmed: boolean
  ): Promise<TeamMemberResponse> {
    try {
      const result = await apiRequest<TeamMemberResponse>(`/api/team/admin/${id}/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': photo.type,
          'X-Photo-Permission-Confirmed': String(permissionConfirmed),
        },
        body: photo,
      }, true);
      if (result?.member) {
        return result;
      }
    } catch {
      // Fallback to local store
    }

    const dataUrl = await fileToDataUrl(photo);
    const members = loadLocalTeam();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error('टीम सदस्य नहीं मिला।');
    }
    const updated: TeamMember = {
      ...members[index],
      hasPhoto: true,
      photoPermissionConfirmed: permissionConfirmed,
      photoUrl: dataUrl,
      updatedAt: new Date().toISOString(),
    };
    members[index] = updated;
    saveLocalTeam(members);
    return { success: true, member: updated };
  },

  async getAdminPhoto(id: string): Promise<Blob> {
    try {
      return await apiBlobRequest(`/api/team/admin/${id}/photo`);
    } catch {
      // Fallback to local photo or placeholder
    }

    const members = loadLocalTeam();
    const member = members.find((m) => m.id === id);
    if (member?.photoUrl) {
      if (member.photoUrl.startsWith('data:')) {
        return dataUrlToBlob(member.photoUrl);
      }
      try {
        const fetched = await fetch(member.photoUrl);
        if (fetched.ok) {
          return await fetched.blob();
        }
      } catch {
        // Continue to placeholder
      }
    }

    try {
      const placeholder = await fetch('/team-placeholder.svg');
      if (placeholder.ok) return await placeholder.blob();
    } catch {
      // ignore
    }
    return new Blob([], { type: 'image/svg+xml' });
  },

  async setPublished(id: string, isPublished: boolean): Promise<TeamMemberResponse> {
    try {
      const result = await apiRequest<TeamMemberResponse>(`/api/team/admin/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished }),
      }, true);
      if (result?.member) {
        return result;
      }
    } catch {
      // Fallback to local store
    }

    const members = loadLocalTeam();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error('टीम सदस्य नहीं मिला।');
    }
    const member = members[index];
    if (isPublished && !member.hasPhoto) {
      throw new Error('बिना फोटो के सदस्य प्रकाशित नहीं किया जा सकता।');
    }
    if (isPublished && !member.isDemo && !member.photoPermissionConfirmed) {
      throw new Error('प्रकाशन से पहले फोटो उपयोग की अनुमति की पुष्टि आवश्यक है।');
    }

    const updated: TeamMember = {
      ...member,
      isPublished,
      updatedAt: new Date().toISOString(),
    };
    members[index] = updated;
    saveLocalTeam(members);
    return {
      success: true,
      member: updated,
      warning: member.isDemo && isPublished
        ? 'डेमो सदस्य प्रकाशित किया गया है। वास्तविक सार्वजनिक पहचान हेतु बाद में मूल विवरण अपडेट करें।'
        : undefined,
    };
  },

  async deleteMember(id: string): Promise<{ success: boolean; warning?: string }> {
    try {
      const result = await apiRequest<{ success: boolean; warning?: string }>(`/api/team/admin/${id}`, {
        method: 'DELETE',
      }, true);
      if (result?.success) {
        return result;
      }
    } catch {
      // Fallback to local store
    }

    const members = loadLocalTeam();
    const filtered = members.filter((m) => m.id !== id);
    saveLocalTeam(filtered);
    return { success: true };
  },

  getPhotoUrl(member: TeamMember, admin = false): string {
    if (member.photoUrl) {
      if (
        member.photoUrl.startsWith('data:') ||
        member.photoUrl.startsWith('blob:') ||
        member.photoUrl.startsWith('http://') ||
        member.photoUrl.startsWith('https://') ||
        member.photoUrl.startsWith('/')
      ) {
        return member.photoUrl;
      }
    }
    return admin
      ? apiUrl(`/api/team/admin/${member.id}/photo`)
      : apiUrl(`/api/team/${member.id}/photo`);
  },

  resetToDefaultDemo(): void {
    saveLocalTeam(DEFAULT_DEMO_TEAM_MEMBERS);
  },
};
