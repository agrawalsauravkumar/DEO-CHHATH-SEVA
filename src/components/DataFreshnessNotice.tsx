import React from 'react';

export const DataFreshnessNotice: React.FC = () => (
  <div
    role="note"
    className="mx-auto my-2 w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950"
  >
    इस स्क्रीन की जगहें और सेवाएँ स्थिर ऐप डेटा हैं—लाइव स्थिति या वर्तमान उपलब्धता सत्यापित नहीं है। वहाँ जाने से पहले स्थानीय रूप से पुष्टि करें।
  </div>
);
