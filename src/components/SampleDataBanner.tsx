import React from 'react';
import { Info } from 'lucide-react';

interface Props {
  text?: string;
}

export const SampleDataBanner: React.FC<Props> = ({
  text = 'सार्वजनिक सूचना: यह केवल नमूना (डेमो) डेटा है। वास्तविक लाइव भीड़ व जीपीएस डेटा आगामी चरण में जुड़ेगा।',
}) => {
  return (
    <div className="flex items-start gap-2 bg-amber-100/80 border border-amber-300/80 text-amber-950 px-3.5 py-2.5 rounded-xl text-xs leading-relaxed my-2">
      <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
      <span className="font-medium">{text}</span>
    </div>
  );
};
