/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChhathSongTrack } from '../services/AudioCacheService';

export const CHHATH_DEFAULT_PLAYLIST: ChhathSongTrack[] = [
  {
    id: 'chhath-track-1',
    title: 'काँच ही बाँस के बहँगिया',
    singer: 'शारदा सिन्हा (अमर लोक स्वर)',
    category: 'GEET',
    language: 'Bhojpuri',
    duration: 361,
    durationFormatted: '06:01',
    sizeFormatted: '5.5 MB',
    audioUrl: '/audio/chhath/kaanch-hi-baans-ke-bahangiya.mp3',
    fallbackAudioUrl: 'https://archive.org/download/ChhathSongs1-77/Kaanch%20Hi%20Baans%20Ke%20Bahangiya.mp3',
    coverUrl: '/audio/artwork/bahangiya.svg',
    tagline: 'सूप-दउरा उठाव व देव सूर्य कुंड घाट प्रस्थान',
    meaning: 'बांस की बहंगी में पावन दउरा और सूप सजाकर छठ व्रती और परिजन देव के सूर्य कुंड घाट की ओर प्रस्थान करते हैं।',
    lyrics: [
      'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…',
      'बहँगी लचकत जाए, बहँगी लचकत जाए…',
      'बात जे पुछेले बटोहिया, बहँगी केकरा के जाए?',
      'तू त आन्हर हउवे रे बटोहिया, बहँगी छठी माई के जाए…',
      'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…',
      'सूपे सूपे निपले अंगनवा, अरघ के बेरा भईल…',
      'उग हे सुरुज देव, अरघ के बेरा भईल…',
    ],
    timestampedLyrics: [
      { time: 0, text: 'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…' },
      { time: 35, text: 'बहँगी लचकत जाए, बहँगी लचकत जाए…' },
      { time: 68, text: 'बात जे पुछेले बटोहिया, बहँगी केकरा के जाए?' },
      { time: 105, text: 'बहँगी केकरा के जाए, बहँगी केकरा के जाए?' },
      { time: 142, text: 'तू त आन्हर हउवे रे बटोहिया, बहँगी छठी माई के जाए…' },
      { time: 184, text: 'बहँगी छठी माई के जाए, बहँगी देव घाट के जाए…' },
      { time: 220, text: 'काँच ही बाँस के बहँगिया, बहँगी लचकत जाए…' },
      { time: 258, text: 'सूपे सूपे निपले अंगनवा, अरघ के बेरा भईल…' },
      { time: 295, text: 'अरघ के बेरा भईल, पूजन के बेरा भईल…' },
      { time: 325, text: 'उग हे सुरुज देव, अरघ के बेरा भईल…' },
    ],
    allowDownload: true,
  },
  {
    id: 'chhath-track-2',
    title: 'उग हे सुरुज देव (उगो उगो सुरुज देव)',
    singer: 'पारंपरिक सांध्य व उषा अर्घ्य गान',
    category: 'GEET',
    language: 'Bhojpuri',
    duration: 344,
    durationFormatted: '05:44',
    sizeFormatted: '5.2 MB',
    audioUrl: '/audio/chhath/ug-he-suraj-dev.mp3',
    fallbackAudioUrl: 'https://archive.org/download/ChhathSongs1-77/Ugo%20UgoSuruj%20Deb.mp3',
    coverUrl: '/audio/artwork/suraj-dev.svg',
    tagline: 'भगवान भुवन भास्कर को भावपूर्ण सांध्य व उषा अर्घ्य पुकार',
    meaning: 'शीतल सूर्य कुंड के पावन जल में कमर तक खड़े होकर दोनों कर जोड़कर भगवान भास्कर से दर्शन देने की भावपूर्ण प्रार्थना।',
    lyrics: [
      'उगो उगो सुरुज देव, अरघ के बेरा भईल…',
      'अरघ के बेरा भईल, पूजन के बेरा भईल…',
      'जल बीच ठाढ़ व्रती विनती करेली…',
      'दर्शन देहू सुरुज देव, अरघ के बेरा भईल…',
      'अन्हरिया भगावल, जगमग उजियार भईल…',
      'दीनानाथ हे प्रभु, तोहर जय-जयकार भईल…',
    ],
    timestampedLyrics: [
      { time: 0, text: 'उगो उगो सुरुज देव, अरघ के बेरा भईल…' },
      { time: 42, text: 'अरघ के बेरा भईल, पूजन के बेरा भईल…' },
      { time: 88, text: 'जल बीच ठाढ़ व्रती विनती करेली…' },
      { time: 135, text: 'विनती करेली, दोनों कर जोरी विनती करेली…' },
      { time: 180, text: 'दर्शन देहू सुरुज देव, अरघ के बेरा भईल…' },
      { time: 226, text: 'अन्हरिया भगावल, जगमग उजियार भईल…' },
      { time: 270, text: 'दीनानाथ हे प्रभु, तोहर जय-जयकार भईल…' },
      { time: 310, text: 'उगो उगो सुरुज देव, अरघ के बेरा भईल…' },
    ],
    allowDownload: true,
  },
  {
    id: 'chhath-track-3',
    title: 'केलवा के पात पर उगेलन सुरुजमल',
    singer: 'पारंपरिक मांगलिक अर्घ्य गीत',
    category: 'GEET',
    language: 'Bhojpuri',
    duration: 499,
    durationFormatted: '08:19',
    sizeFormatted: '7.6 MB',
    audioUrl: '/audio/chhath/kelwa-ke-paat-par.mp3',
    fallbackAudioUrl: 'https://archive.org/download/ChhathSongs1-77/Kelwa%20Ke%20Paat%20Par.mp3',
    coverUrl: '/audio/artwork/kelwa-paat.svg',
    tagline: 'पवित्र वेदी, ऋतु फल व प्रसाद अर्पण',
    meaning: 'केले के पत्तों और सूप में सजे ऋतु फलों के मध्य भगवान सूर्य की स्वर्णिम किरणों का अवतरण।',
    lyrics: [
      'केलवा के पात पर उगेलन सुरुजमल झांके झुके…',
      'करेलू छठ परबिया, से झांके झुके…',
      'हम तोसे पुछी बरतिया हे, कवन फल पावेला…',
      'से कवन फल पावेला, कवन पुण्य पावेला…',
      'पुत्र पावे अन्न-धन लछिमी, अमर सुहाग पावेला…',
      'केलवा के पात पर उगेलन सुरुजमल झांके झुके…',
    ],
    timestampedLyrics: [
      { time: 0, text: 'केलवा के पात पर उगेलन सुरुजमल झांके झुके…' },
      { time: 60, text: 'झांके झुके, सुरुजमल झांके झुके…' },
      { time: 130, text: 'करेलू छठ परबिया, से झांके झुके…' },
      { time: 195, text: 'हम तोसे पुछी बरतिया हे, कवन फल पावेला…' },
      { time: 265, text: 'से कवन फल पावेला, कवन पुण्य पावेला…' },
      { time: 340, text: 'पुत्र पावे अन्न-धन लछिमी, अमर सुहाग पावेला…' },
      { time: 420, text: 'केलवा के पात पर उगेलन सुरुजमल झांके झुके…' },
    ],
    allowDownload: true,
  },
  {
    id: 'chhath-track-4',
    title: 'हो दीनानाथ (सातहु घोड़वा रथवा)',
    singer: 'शारदा सिन्हा (अमर छठ स्वर)',
    category: 'GEET',
    language: 'Bhojpuri',
    duration: 540,
    durationFormatted: '09:00',
    sizeFormatted: '8.2 MB',
    audioUrl: '/audio/chhath/ho-dinanath.mp3',
    fallbackAudioUrl: 'https://archive.org/download/ChhathSongs1-77/Ho%20Dinaanaath%201.mp3',
    coverUrl: '/audio/artwork/dinanath.svg',
    tagline: 'दीनानाथ प्रभु की स्तुति व सूर्य अर्घ्य निवेदन',
    meaning: 'दीनों के रक्षक दीनानाथ भुवन भास्कर को संपूर्ण भाव से समर्पित महापर्व का सर्वोच्च भक्ति गान।',
    lyrics: [
      'हो दीनानाथ, जल बिच ठाढ़ अरघ हम दीहीं…',
      'सुन लीहीं अरज हमार हे दीनानाथ…',
      'सातहु घोड़वा रथवा सजाय के…',
      'अइहें सुरुज देव दर्शन देखाय के…',
      'हो दीनानाथ, जल बिच ठाढ़ अरघ हम दीहीं…',
    ],
    timestampedLyrics: [
      { time: 0, text: 'हो दीनानाथ, जल बिच ठाढ़ अरघ हम दीहीं…' },
      { time: 75, text: 'सुन लीहीं अरज हमार हे दीनानाथ…' },
      { time: 160, text: 'सातहु घोड़वा रथवा सजाय के…' },
      { time: 260, text: 'अइहें सुरुज देव दर्शन देखाय के…' },
      { time: 380, text: 'हो दीनानाथ, जल बिच ठाढ़ अरघ हम दीहीं…' },
    ],
    allowDownload: true,
  },
  {
    id: 'chhath-track-5',
    title: 'छठी माई के दउरा (सूपे सूपे दीप)',
    singer: 'पारंपरिक लोक स्वर',
    category: 'GEET',
    language: 'Bhojpuri',
    duration: 380,
    durationFormatted: '06:20',
    sizeFormatted: '5.8 MB',
    audioUrl: '/audio/chhath/chhathi-maai-ke-daura.mp3',
    fallbackAudioUrl: 'https://archive.org/download/ChhathSongs1-77/Chhathi%20Maai%20Ke%20Daurha.mp3',
    coverUrl: '/audio/artwork/daura.svg',
    tagline: 'माथे पर पावन दउरा लिए घाट की ओर बढ़ते कदम',
    meaning: 'छठ व्रती के परिजन सिर पर दउरा उठाकर नंगे पांव सूर्य मंदिर और सूर्य कुंड की ओर बढ़ते हैं।',
    lyrics: [
      'छठी माई के दउरा सजावल बा…',
      'सूपे सूपे दीप जलावल बा…',
      'चलू-चलू सभे देव के घाट…',
      'छठी माई के पावन बेरा बा…',
    ],
    timestampedLyrics: [
      { time: 0, text: 'छठी माई के दउरा सजावल बा…' },
      { time: 55, text: 'सूपे सूपे दीप जलावल बा…' },
      { time: 130, text: 'चलू-चलू सभे देव के घाट…' },
      { time: 220, text: 'छठी माई के पावन बेरा बा…' },
    ],
    allowDownload: true,
  },
  {
    id: 'chhath-track-6',
    title: 'मारबो रे सुगवा धनुष से',
    singer: 'पारंपरिक अमर छठ लोकगीत',
    category: 'GEET',
    language: 'Bhojpuri',
    duration: 407,
    durationFormatted: '06:47',
    sizeFormatted: '6.2 MB',
    audioUrl: '/audio/chhath/marabo-re-sugava.mp3',
    fallbackAudioUrl: 'https://archive.org/download/ChhathSongs1-77/Marabo%20Re%20Sugava%20Dhanus%20Se.mp3',
    coverUrl: '/audio/artwork/sugava.svg',
    tagline: 'पवित्र प्रसाद की शुचिता व सुग्गा (तोता) लोक संवाद',
    meaning: 'छठी मइया के लिए रोपे गए फल-प्रसाद की शुचिता की रक्षा हेतु पारंपरिक लोक गाथा।',
    lyrics: [
      'मारबो रे सुगवा धनुष से, सुगा गिरे मुरझाय…',
      'सुगा गिरे मुरझाय, सुगा गिरे मुरझाय…',
      'उ जे सुगनी जे रोवे ले वियोग से, आदित होई ना सहाय…',
      'देव के घाटवा पर बरतिया करेली, सुगा जुठ मत कर जाय…',
    ],
    timestampedLyrics: [
      { time: 0, text: 'मारबो रे सुगवा धनुष से, सुगा गिरे मुरझाय…' },
      { time: 50, text: 'सुगा गिरे मुरझाय, सुगा गिरे मुरझाय…' },
      { time: 130, text: 'उ जे सुगनी जे रोवे ले वियोग से, आदित होई ना सहाय…' },
      { time: 230, text: 'देव के घाटवा पर बरतिया करेली, सुगा जुठ मत कर जाय…' },
    ],
    allowDownload: true,
  },
];

const ADMIN_SONGS_STORAGE_KEY = 'deo_chhath_admin_songs_v1';

export const ChhathSongsService = {
  getAllSongs(): ChhathSongTrack[] {
    try {
      const stored = localStorage.getItem(ADMIN_SONGS_STORAGE_KEY);
      if (stored) {
        const adminSongs: ChhathSongTrack[] = JSON.parse(stored);
        return [...adminSongs, ...CHHATH_DEFAULT_PLAYLIST];
      }
    } catch (e) {
      console.warn('Failed to parse admin songs from localStorage:', e);
    }
    return CHHATH_DEFAULT_PLAYLIST;
  },

  getSongById(id: string): ChhathSongTrack | undefined {
    return this.getAllSongs().find((s) => s.id === id);
  },

  addSong(song: ChhathSongTrack): void {
    try {
      const stored = localStorage.getItem(ADMIN_SONGS_STORAGE_KEY);
      const adminSongs: ChhathSongTrack[] = stored ? JSON.parse(stored) : [];
      // Replace if exists, else prepend
      const index = adminSongs.findIndex((s) => s.id === song.id);
      if (index >= 0) {
        adminSongs[index] = song;
      } else {
        adminSongs.unshift(song);
      }
      localStorage.setItem(ADMIN_SONGS_STORAGE_KEY, JSON.stringify(adminSongs));
    } catch (e) {
      console.error('Failed to save song:', e);
      throw e;
    }
  },

  deleteSong(id: string): void {
    try {
      const stored = localStorage.getItem(ADMIN_SONGS_STORAGE_KEY);
      if (stored) {
        const adminSongs: ChhathSongTrack[] = JSON.parse(stored);
        const filtered = adminSongs.filter((s) => s.id !== id);
        localStorage.setItem(ADMIN_SONGS_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Failed to delete song:', e);
      throw e;
    }
  },
};
