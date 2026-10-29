import React, { useCallback, useEffect, useState } from 'react';
import { Check, Eye, EyeOff, ImagePlus, Pencil, Plus, RefreshCw, RotateCcw, Trash2, X } from 'lucide-react';
import { TeamMember, TeamService } from '../services/TeamService';

interface Props {
  notify: (message: string) => void;
}

const AdminTeamPhoto: React.FC<{
  memberId?: string;
  source?: string;
  alt: string;
  className: string;
}> = ({ memberId, source, alt, className }) => {
  const [imageUrl, setImageUrl] = useState('/team-placeholder.svg');

  useEffect(() => {
    if (source) {
      setImageUrl(source);
      return;
    }
    if (!memberId) {
      setImageUrl('/team-placeholder.svg');
      return;
    }
    let active = true;
    let objectUrl: string | undefined;
    setImageUrl('/team-placeholder.svg');
    TeamService.getAdminPhoto(memberId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) {
          setImageUrl(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      })
      .catch(() => {
        if (active) setImageUrl('/team-placeholder.svg');
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [memberId, source]);

  return <img src={imageUrl} alt={alt} className={className} />;
};

export const TeamManagementPanel: React.FC<Props> = ({ notify }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [biography, setBiography] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [photoPermissionConfirmed, setPhotoPermissionConfirmed] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await TeamService.getAdminMembers();
      setMembers(response.members);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'टीम सूची लोड नहीं हो सकी।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('');
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const resetForm = () => {
    setFormOpen(false);
    setEditingMember(null);
    setFullName('');
    setDesignation('');
    setBiography('');
    setIsDemo(false);
    setPhotoPermissionConfirmed(false);
    setPhoto(null);
  };

  const openNewForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (member: TeamMember) => {
    setEditingMember(member);
    setFullName(member.fullName);
    setDesignation(member.designation);
    setBiography(member.biography || '');
    setIsDemo(member.isDemo);
    setPhotoPermissionConfirmed(Boolean(member.photoPermissionConfirmed));
    setPhoto(null);
    setFormOpen(true);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.currentTarget.files?.[0] || null;
    event.currentTarget.value = '';
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      notify('केवल JPG, PNG या WebP फोटो चुनें।');
      return;
    }
    if (selected.size === 0 || selected.size > 5 * 1024 * 1024) {
      notify('फोटो खाली नहीं होनी चाहिए और 5 MB से बड़ी नहीं हो सकती।');
      return;
    }
    setPhoto(selected);
    setPhotoPermissionConfirmed(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedDesignation = designation.trim();
    const trimmedBio = biography.trim();
    if (!trimmedName || trimmedName.length > 150 || !trimmedDesignation || trimmedDesignation.length > 120) {
      notify('नाम और पद भरें; नाम 150 और पद 120 अक्षरों तक हो सकता है।');
      return;
    }
    if (trimmedBio.length > 1000) {
      notify('संक्षिप्त परिचय (Biography) अधिकतम 1000 अक्षरों तक हो सकता है।');
      return;
    }
    if (!editingMember && !photo) {
      notify('प्रोफ़ाइल के लिए फोटो चुनना आवश्यक है।');
      return;
    }
    if (photo && !photoPermissionConfirmed) {
      notify('फोटो अपलोड करने से पहले उसके उपयोग की अनुमति की पुष्टि करें।');
      return;
    }

    setBusyId(editingMember?.id || 'new');
    try {
      let saved = editingMember
        ? (await TeamService.updateMember(editingMember.id, {
            fullName: trimmedName,
            designation: trimmedDesignation,
            biography: trimmedBio || undefined,
            isDemo,
          })).member
        : (await TeamService.createMember({
            fullName: trimmedName,
            designation: trimmedDesignation,
            biography: trimmedBio || undefined,
          })).member;

      if (!editingMember) setEditingMember(saved);
      if (photo) saved = (await TeamService.uploadPhoto(saved.id, photo, photoPermissionConfirmed)).member;
      await loadMembers();
      resetForm();
      notify('टीम सदस्य का विवरण सर्वर पर सहेजा गया। प्रकाशन अलग से करें।');
    } catch (error) {
      notify(`बदलाव सहेजे नहीं गए: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
    } finally {
      setBusyId(null);
    }
  };

  const handlePublish = async (member: TeamMember) => {
    setBusyId(member.id);
    try {
      const result = await TeamService.setPublished(member.id, !member.isPublished);
      await loadMembers();
      notify(result.warning || (result.member.isPublished ? 'सदस्य सार्वजनिक टीम में प्रकाशित हुआ।' : 'सदस्य सार्वजनिक टीम से हटाया गया।'));
    } catch (error) {
      notify(`प्रकाशन स्थिति नहीं बदली: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    if (!window.confirm(`क्या “${member.fullName}” को टीम सूची से हटाना चाहते हैं?`)) return;
    setBusyId(member.id);
    try {
      const result = await TeamService.deleteMember(member.id);
      await loadMembers();
      notify(result.warning || 'टीम सदस्य हटाया गया।');
    } catch (error) {
      notify(`सदस्य नहीं हटाया गया: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-[#075985]/15 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="team-management-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="team-management-heading" className="text-xl font-black text-[#063B5C]">हमारी टीम प्रबंधन</h2>
          <p className="mt-1 text-sm text-stone-600">विवरण सहेजने के बाद फोटो जोड़ें और समीक्षा के पश्चात प्रकाशित करें।</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('क्या आप डिफ़ॉल्ट डेमो टीम प्रोफ़ाइल पुनर्स्थापित करना चाहते हैं?')) {
                TeamService.resetToDefaultDemo();
                void loadMembers();
                notify('डिफ़ॉल्ट डेमो टीम प्रोफ़ाइल सफलतापूर्वक लोड की गईं।');
              }
            }}
            aria-label="डिफ़ॉल्ट डेमो टीम लोड करें"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-900 hover:bg-amber-100"
            title="डिफ़ॉल्ट डेमो टीम डेटा लोड करें"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            <span>डेमो रीसेट</span>
          </button>
          <button type="button" onClick={() => void loadMembers()} disabled={loading} aria-label="टीम सूची पुनः लोड करें" className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-[#075985]/20 text-[#075985] disabled:opacity-50">
            <RefreshCw className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={openNewForm} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#075985] px-4 font-bold text-white">
            <Plus className="h-4 w-4" aria-hidden /> सदस्य जोड़ें
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-[#A61B29]/25 bg-[#A61B29]/5 p-4 text-sm text-[#7F1D1D]" role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={() => void loadMembers()} className="mt-2 font-bold underline">पुनः प्रयास करें</button>
        </div>
      )}
      {loading && <p className="py-6 text-center text-sm font-semibold text-stone-600" role="status">टीम सूची लोड हो रही है…</p>}
      {!loading && !loadError && members.length === 0 && (
        <p className="rounded-xl bg-[#FFF7E5] p-5 text-center text-sm font-semibold text-stone-700">अभी कोई टीम सदस्य नहीं है। पहला सदस्य जोड़ें।</p>
      )}

      {!loading && members.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="bg-[#FFF7E5] text-[#063B5C]">
              <tr>
                <th className="p-3 font-black">सदस्य</th>
                <th className="p-3 font-black">स्थिति</th>
                <th className="p-3 text-right font-black">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <AdminTeamPhoto
                        memberId={member.id}
                        alt=""
                        className="h-12 w-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="break-words font-bold text-[#063B5C]">{member.fullName}</p>
                        <p className="break-words text-xs text-stone-600">{member.designation}</p>
                        {member.biography && (
                          <p className="mt-0.5 max-w-xs truncate text-[11px] italic text-stone-500">{member.biography}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${member.isPublished ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-700'}`}>
                        {member.isPublished ? 'प्रकाशित' : 'ड्राफ्ट'}
                      </span>
                      {member.isDemo && <span className="rounded-full bg-[#FFB52E]/25 px-2 py-1 text-[11px] font-bold text-[#754900]">डेमो</span>}
                      {!member.hasPhoto && <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800">फोटो आवश्यक</span>}
                      {!member.isDemo && !member.photoPermissionConfirmed && <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800">फोटो अनुमति बाकी</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => openEditForm(member)} disabled={busyId === member.id} title="सदस्य संपादित करें" aria-label={`${member.fullName} संपादित करें`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-stone-200 text-[#075985] disabled:opacity-50">
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button type="button" onClick={() => void handlePublish(member)} disabled={busyId === member.id || (!member.isPublished && (!member.hasPhoto || (!member.isDemo && !member.photoPermissionConfirmed)))} title={member.isPublished ? 'Unpublish' : 'Publish'} aria-label={member.isPublished ? `${member.fullName} अप्रकाशित करें` : `${member.fullName} प्रकाशित करें`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-stone-200 text-[#075985] disabled:opacity-40">
                        {member.isPublished ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                      </button>
                      <button type="button" onClick={() => void handleDelete(member)} disabled={busyId === member.id} title="हटाएँ" aria-label={`${member.fullName} हटाएँ`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-rose-200 text-rose-700 disabled:opacity-50">
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-6" role="presentation">
          <form onSubmit={(event) => void handleSave(event)} className="my-auto w-full max-w-lg space-y-4 rounded-3xl bg-white p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="team-member-form-heading">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="team-member-form-heading" className="text-lg font-black text-[#063B5C]">{editingMember ? 'टीम सदस्य संपादित करें' : 'नया टीम सदस्य'}</h3>
                <p className="text-xs text-stone-600">प्रकाशन से पहले विवरण और फोटो की स्वीकृति सुनिश्चित करें।</p>
              </div>
              <button type="button" onClick={resetForm} aria-label="फ़ॉर्म बंद करें" className="grid min-h-10 min-w-10 place-items-center rounded-lg text-stone-600">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <label className="block space-y-1 text-sm font-bold text-stone-700">
              <span>पूरा नाम</span>
              <input autoFocus required maxLength={150} value={fullName} onChange={(event) => setFullName(event.currentTarget.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3" />
            </label>
            <label className="block space-y-1 text-sm font-bold text-stone-700">
              <span>पद</span>
              <input required maxLength={120} value={designation} onChange={(event) => setDesignation(event.currentTarget.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3" />
            </label>
            <label className="block space-y-1 text-sm font-bold text-stone-700">
              <div className="flex justify-between items-center">
                <span>संक्षिप्त परिचय (Biography - ऐच्छिक)</span>
                <span className="text-xs font-normal text-stone-500">{biography.length}/1000</span>
              </div>
              <textarea
                maxLength={1000}
                rows={3}
                value={biography}
                onChange={(event) => setBiography(event.currentTarget.value)}
                placeholder="संस्था में भूमिका, कार्यक्षेत्र या संक्षिप्त परिचय..."
                className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-[#075985] focus:outline-hidden"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-3 text-sm font-semibold text-stone-700">
              <input type="checkbox" checked={isDemo} onChange={(event) => setIsDemo(event.currentTarget.checked)} className="h-5 w-5 accent-[#075985]" />
              यह केवल डेमो प्रोफ़ाइल है
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#075985]/20 bg-[#FFF7E5] p-3 text-sm font-semibold leading-relaxed text-stone-700">
              <input
                type="checkbox"
                checked={photoPermissionConfirmed}
                onChange={(event) => setPhotoPermissionConfirmed(event.currentTarget.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#075985]"
              />
              संबंधित सदस्य/संस्था से इस फोटो के उपयोग और सार्वजनिक प्रकाशन की अनुमति प्राप्त है।
            </label>
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <AdminTeamPhoto
                memberId={editingMember?.id}
                source={photoPreview || undefined}
                alt="फोटो का पूर्वावलोकन"
                className="aspect-[4/5] w-20 rounded-xl border border-stone-200 object-cover"
              />
              <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#075985]/40 bg-[#FFF7E5] px-3 text-sm font-bold text-[#075985]">
                <ImagePlus className="h-4 w-4" aria-hidden />
                {photo ? photo.name : 'फोटो चुनें (JPG, PNG, WebP; अधिकतम 5 MB)'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="sr-only" />
              </label>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-stone-100 pt-4">
              <button type="button" onClick={resetForm} className="min-h-11 rounded-xl border border-stone-300 px-4 font-bold text-stone-700">रद्द करें</button>
              <button type="submit" disabled={busyId !== null} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#075985] px-5 font-bold text-white disabled:opacity-50">
                <Check className="h-4 w-4" aria-hidden />
                {busyId !== null ? 'सहेजा जा रहा है…' : 'सहेजें'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
