import { apiUrl } from './apiUrl';
import { apiBlobRequest, apiRequest } from './apiClient';

export interface TeamMember {
  id: string;
  fullName: string;
  designation: string;
  biography?: string;
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

const TEAM_STORAGE_KEY = 'deo_team_members_store_v2';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function makeSvgAvatar(id: string, initials: string, titleShort: string, primaryColor: string, secondaryColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="g_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g_${id})"/>
  <circle cx="200" cy="175" r="90" fill="#FFF7E5" opacity="0.95"/>
  <circle cx="200" cy="175" r="80" fill="${secondaryColor}" opacity="0.12"/>
  <text x="200" y="193" font-family="'Noto Sans Devanagari', 'Inter', sans-serif, system-ui" font-size="44" font-weight="900" fill="${secondaryColor}" text-anchor="middle">${initials}</text>
  <path d="M70 440 C70 295, 330 295, 330 440 Z" fill="#FFF7E5" opacity="0.95"/>
  <path d="M95 440 C95 320, 305 320, 305 440 Z" fill="${secondaryColor}" opacity="0.18"/>
  <rect x="25" y="435" width="350" height="45" rx="14" fill="${secondaryColor}" opacity="0.9"/>
  <text x="200" y="463" font-family="'Noto Sans Devanagari', 'Inter', sans-serif, system-ui" font-size="16" font-weight="bold" fill="#FFB52E" text-anchor="middle">${titleShort}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'demo-member-1',
    fullName: 'सौरव कुमार (Saurav Kumar)',
    designation: 'मुख्य संयोजक एवं राष्ट्रीय अध्यक्ष',
    biography: 'संस्था के मुख्य संस्थापक, देव छठ महापर्व में लाखों श्रद्धालुओं की सुविधा, डिजिटल सेवा व समग्र प्रबंधन के मुख्य मार्गदर्शक।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('1', 'सौरव', 'मुख्य नेतृत्व', '#0C4A6E', '#063B5C'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-2',
    fullName: 'राहुल कुमार (Rahul Kumar)',
    designation: 'सह-संयोजक एवं मुख्य संचालन अधिकारी',
    biography: 'ज़मीनी व्यवस्था, जिला प्रशासन समन्वय, सुरक्षा व आपातकालीन सहायता नियंत्रण कक्ष का समग्र प्रभार।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('2', 'राहुल', 'संचालन प्रमुख', '#1E3A8A', '#1E40AF'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-3',
    fullName: 'प्रिया कुमारी (Priya Kumari)',
    designation: 'महिला एवं बाल सहायता प्रकोष्ठ प्रमुख',
    biography: 'छठ व्रती माताओं-बहनों की सुरक्षा, खोया-पाया केंद्र, महिला चेंजिंग रूम व विशेष प्राथमिक सहायता डेस्क प्रभारी।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('3', 'प्रिया', 'महिला/बाल सुरक्षा', '#991B1B', '#7F1D1D'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-4',
    fullName: 'अमित कुमार शर्मा (Amit Sharma)',
    designation: 'मुख्य तकनीकी अधिकारी एवं डिजिटल सेवा प्रमुख',
    biography: 'ऑफलाइन जीपीएस मैप्स, लाइव नेविगेशन सिस्टम, ऐप विकास एवं कंट्रोल रूम डिजिटल प्रणाली प्रभारी।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('4', 'अमित', 'IT/डिजिटल सेवा', '#0E7490', '#155E75'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-5',
    fullName: 'विकास कुमार सिंह (Vikash Singh)',
    designation: 'सूर्य कुंड महातीर्थ एवं घाट प्रबंधन प्रभारी',
    biography: 'सूर्य कुंड एवं रुद्र कुंड घाटों पर जल-सुरक्षा, बैरिकेडिंग, गोताखोर टीम, सफाई एवं सीढ़ीदार सुरक्षा व्यवस्था।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('5', 'विकास', 'घाट प्रबंधन', '#9A3412', '#7C2D12'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-6',
    fullName: 'पूजा वर्मा (Pooja Verma)',
    designation: 'स्वयंसेवक समन्वयिका एवं स्वास्थ्य डेस्क',
    biography: '500+ पंजीकृत स्वयंसेवकों की तैनाती, फर्स्ट-एड मेडिकल सहायता एवं श्रद्धालु मार्गदर्शन प्रभारी।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('6', 'पूजा', 'स्वयंसेवक प्रमुख', '#166534', '#14532D'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-7',
    fullName: 'डॉ. राजेश रंजन (Dr. Rajesh Ranjan)',
    designation: 'वरिष्ठ चिकित्सा सलाहकार एवं स्वास्थ्य शिविर प्रभारी',
    biography: 'देव मेला क्षेत्र में 24×7 आपातकालीन स्वास्थ्य शिविर, ओआरएस वितरण, एम्बुलेंस 108 एवं जीवन रक्षक दवाएँ।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('7', 'राजेश', 'मुख्य चिकित्सक', '#0F766E', '#115E59'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-8',
    fullName: 'संजय कुमार गुप्ता (Sanjay Gupta)',
    designation: 'निःशुल्क महाप्रसाद, सूप व दउरा वितरण प्रमुख',
    biography: 'दूर-दराज से आए निर्धन व्रतियों हेतु निःशुल्क सूप, दउरा, नारियल, शुद्ध देशी घी ठेकुआ एवं कच्चा दूध वितरण।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('8', 'संजय', 'प्रसाद सेवा', '#C2410C', '#9A3412'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-9',
    fullName: 'अनिता देवी (Anita Devi)',
    designation: 'वरिष्ठ मातृ शक्ति मार्गदर्शिका एवं सांस्कृतिक सलाहकार',
    biography: 'छठ महापर्व के वैदिक विधि-विधान, पारंपरिक लोकगीत, पवित्रता, स्वच्छता व सात्विक अनुशासन संरक्षण।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('9', 'अनिता', 'सात्विक परंपरा', '#701A75', '#4A044E'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-10',
    fullName: 'मनोज कुमार यादव (Manoj Yadav)',
    designation: 'यातायात, वाहन पार्किंग एवं शटल बस प्रभारी',
    biography: 'P1 (राजा जगन्नाथ हाई स्कूल), P2 (कॉलेज मैदान), P3 पार्किंग एवं निःशुल्क ई-रिक्शा शटल संचालन।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('10', 'मनोज', 'यातायात प्रभारी', '#312E81', '#1E1B4B'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-11',
    fullName: 'दीपक कुमार मिश्रा (Deepak Mishra)',
    designation: 'सूचना प्रसारण, लाउडस्पीकर एवं खोया-पाया प्रभारी',
    biography: '24 घंटे लाउडस्पीकर कंट्रोल रूम से अपनों से बिछड़े श्रद्धालुओं व बच्चों का त्वरित परिवार मिलान।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('11', 'दीपक', 'उद्घोषणा प्रमुख', '#78350F', '#451A03'),
    createdAt: '2026-10-01T06:00:00.000Z',
    updatedAt: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 'demo-member-12',
    fullName: 'नेहा सिंह (Neha Singh)',
    designation: 'जनसंपर्क, मीडिया एवं श्रद्धालु संवाद प्रभारी',
    biography: 'प्रशासनिक दिशा-निर्देशों का लाइव प्रसारण, सोशल मीडिया हेल्पलाइन, प्रेस विज्ञप्ति एवं सूचना डेस्क।',
    isDemo: true,
    isPublished: true,
    hasPhoto: true,
    photoPermissionConfirmed: true,
    photoUrl: makeSvgAvatar('12', 'नेहा', 'जनसंपर्क प्रमुख', '#831843', '#500724'),
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
    if (Array.isArray(parsed) && parsed.length >= 12) {
      return parsed;
    }
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_TEAM_MEMBERS));
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

  async createMember(fields: { fullName: string; designation: string; biography?: string }): Promise<TeamMemberResponse> {
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
      biography: fields.biography?.trim() || undefined,
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
    fields: { fullName: string; designation: string; biography?: string; isDemo: boolean }
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
      biography: fields.biography?.trim() || undefined,
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
