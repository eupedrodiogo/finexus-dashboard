import { useCallback, useEffect, useRef, useState } from 'react';

// A Web Speech API não tem tipos oficiais no lib.dom do TS — declaramos aqui
// só o pedaço que o hook realmente usa.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

const getRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

export type VoiceRecognitionError = 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'unknown';

/** Reconhecimento de fala do navegador (pt-BR), com transcrição parcial ao vivo. */
export const useSpeechRecognition = () => {
  const Ctor = useRef(getRecognitionCtor()).current;
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<VoiceRecognitionError | null>(null);

  // Encerra a captura se o componente sumir com o microfone ainda aberto
  useEffect(() => () => { recognitionRef.current?.abort(); }, []);

  const start = useCallback(() => {
    if (!Ctor) { setError('unsupported'); return; }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';

    const recognition = new Ctor();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalTranscriptRef.current += result[0].transcript;
        else interim += result[0].transcript;
      }
      setTranscript(finalTranscriptRef.current);
      setInterimTranscript(interim);
    };
    recognition.onerror = (e: any) => {
      const code: VoiceRecognitionError =
        e?.error === 'not-allowed' || e?.error === 'permission-denied' ? 'not-allowed'
        : e?.error === 'no-speech' ? 'no-speech'
        : e?.error === 'network' ? 'network'
        : 'unknown';
      setError(code);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [Ctor]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isSupported: !!Ctor,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
  };
};
