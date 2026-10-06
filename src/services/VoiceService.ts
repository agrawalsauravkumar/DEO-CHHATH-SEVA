/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoiceSpeedPreference } from '../types';

// SpeechRecognition Types
type SpeechRecognitionType = any;

class VoiceServiceManager {
  private isSpeechSupportedValue: boolean;
  private isRecognitionSupportedValue: boolean;
  private recognitionInstance: SpeechRecognitionType | null = null;
  private isListening: boolean = false;
  private speedRate: number = 0.95;
  private currentLanguage: string = 'hi-IN';

  constructor() {
    this.isSpeechSupportedValue =
      typeof window !== 'undefined' && 'speechSynthesis' in window;

    this.isRecognitionSupportedValue =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  // ============================================================
  // TEXT TO SPEECH (TTS)
  // ============================================================
  public isSpeechSupported(): boolean {
    return this.isSpeechSupportedValue;
  }

  public setLanguage(lang: string): void {
    this.currentLanguage = lang;
  }

  public setSpeed(speed: VoiceSpeedPreference): void {
    if (speed === 'SLOW') this.speedRate = 0.75;
    else if (speed === 'FAST') this.speedRate = 1.15;
    else this.speedRate = 0.95;
  }

  public speak(text: string, force: boolean = false): void {
    if (!this.isSpeechSupportedValue || !text.trim()) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.currentLanguage;
      utterance.rate = this.speedRate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback
    }
  }

  public stopSpeaking(): void {
    if (this.isSpeechSupportedValue) {
      window.speechSynthesis.cancel();
    }
  }

  // ============================================================
  // VOICE COMMANDS (Speech Recognition)
  // ============================================================
  public isVoiceRecognitionSupported(): boolean {
    return this.isRecognitionSupportedValue;
  }

  public startListening(
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isRecognitionSupportedValue) {
      onError('Voice command आपके device/browser पर उपलब्ध नहीं है।');
      return false;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        onError('Speech Recognition सुविधा उपलब्ध नहीं है।');
        return false;
      }

      this.stopListening();
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        onError('आवाज़ समझ नहीं आई। कृपया दोबारा बोलें।');
      };

      recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognitionInstance = recognition;
      recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      onError('माइक्रोफोन अनुमति या सेवा में त्रुटि हुई।');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognitionInstance && this.isListening) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  // ============================================================
  // COMMAND PROCESSOR (No fake AI, exact reliable mappings)
  // ============================================================
  public processCommand(commandText: string): {
    screen?: string;
    message: string;
    recognized: boolean;
  } {
    const raw = commandText.trim().toLowerCase();

    // 1. Navigation / Search
    if (
      raw.includes('रास्ता') ||
      raw.includes('मार्ग') ||
      raw.includes('मंदिर') ||
      raw.includes('खोज') ||
      raw.includes('कहाँ')
    ) {
      return {
        screen: 'search',
        message: 'रास्ता और गंतव्य खोज स्क्रीन खोली जा रही है।',
        recognized: true,
      };
    }

    // 2. Medical / Hospital
    if (
      raw.includes('अस्पताल') ||
      raw.includes('मेडिकल') ||
      raw.includes('डॉक्टर') ||
      raw.includes('दवा') ||
      raw.includes('इलाज')
    ) {
      return {
        screen: 'medical',
        message: 'नजदीकी प्राथमिक चिकित्सा एवं मेडिकल शिविर दिखाए जा रहे हैं।',
        recognized: true,
      };
    }

    // 3. Toilet
    if (
      raw.includes('शौचालय') ||
      raw.includes('टॉयलेट') ||
      raw.includes('toilet') ||
      raw.includes('बाथरूम')
    ) {
      return {
        screen: 'toilet',
        message: 'नजदीकी बायो-शौचालय की सूची खोली जा रही है।',
        recognized: true,
      };
    }

    // 4. Water
    if (
      raw.includes('पानी') ||
      raw.includes('जल') ||
      raw.includes('पेयजल') ||
      raw.includes('प्यास')
    ) {
      return {
        screen: 'water',
        message: 'नजदीकी शीतल पेयजल अमृत सेवा काउंटर दिखाए जा रहे हैं।',
        recognized: true,
      };
    }

    // 5. Family
    if (
      raw.includes('परिवार') ||
      raw.includes('फैमिली') ||
      raw.includes('सदस्य') ||
      raw.includes('घर वाले')
    ) {
      return {
        screen: 'family',
        message: 'मेरा परिवार सुरक्षा समूह खोला जा रहा है।',
        recognized: true,
      };
    }

    // 6. Help / Sahayata
    if (
      raw.includes('सहायता') ||
      raw.includes('मदद') ||
      raw.includes('हेल्प') ||
      raw.includes('कंट्रोल')
    ) {
      return {
        screen: 'help',
        message: 'सहायता केंद्र और हेल्प डेस्क स्क्रीन खोली जा रही है।',
        recognized: true,
      };
    }

    // 7. My Location / Map
    if (
      raw.includes('स्थान') ||
      raw.includes('नक्शा') ||
      raw.includes('मैप') ||
      raw.includes('लोकेशन')
    ) {
      return {
        screen: 'map',
        message: 'देव मेला नक्शा और आपका वर्तमान स्थान दिखाया जा रहा है।',
        recognized: true,
      };
    }

    // 8. Parking
    if (raw.includes('पार्किंग') || raw.includes('गाड़ी') || raw.includes('वाहन')) {
      return {
        screen: 'parking',
        message: 'वाहन पड़ाव (पार्किंग स्थल) की स्थिति खोली जा रही है।',
        recognized: true,
      };
    }

    // 9. Shuttle
    if (
      raw.includes('शटल') ||
      raw.includes('रिक्शा') ||
      raw.includes('ई-रिक्शा') ||
      raw.includes('गाड़ी सेवा')
    ) {
      return {
        screen: 'shuttle',
        message: 'मुफ्त ई-रिक्शा शटल सेवा की जानकारी खोली जा रही है।',
        recognized: true,
      };
    }

    // 10. Lost & Found
    if (
      raw.includes('खोया') ||
      raw.includes('पाया') ||
      raw.includes('लापता') ||
      raw.includes('सामान')
    ) {
      return {
        screen: 'lost-found',
        message: 'खोया-पाया सहायता केंद्र खोला जा रहा है।',
        recognized: true,
      };
    }

    // 11. Emergency / Police
    if (
      raw.includes('आपात') ||
      raw.includes('पुलिस') ||
      raw.includes('खतरा') ||
      raw.includes('इमरजेंसी') ||
      raw.includes('sos')
    ) {
      return {
        screen: 'emergency',
        message: 'आपातकालीन सहायता और पुलिस सहायता केंद्र खोला जा रहा है।',
        recognized: true,
      };
    }

    // Default unrecognized
    return {
      message: 'यह command अभी उपलब्ध नहीं है। उपलब्ध: "रास्ता दिखाओ", "पास का अस्पताल", "पानी", "शौचालय", "मेरा परिवार", "सहायता"।',
      recognized: false,
    };
  }
}

export const VoiceService = new VoiceServiceManager();
