import { Btn, Modal, FlagMark } from '../components/ui';
import type { TFn } from '../i18n';
import { useGame } from '../engine/store';
import { useState } from 'react';

export function AboutPage({ t }: { t: TFn }) {
  const store = useGame();
  const ne = store.settings.lang === 'ne';
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="container page-pad" style={{ paddingTop: 16 }}>
      <div className="card glow center">
        <FlagMark className="intro-flag" />
        <h2 className="mt8">{t('appName')}</h2>
        <p className="muted small">{t('tagline')} · v1.0</p>
      </div>

      <div className="card mt14">
        <h3>🗺️ {ne ? 'नक्सा तथ्याङ्क' : 'Map data'}</h3>
        <p className="small muted mt8">
          {ne
            ? '७ प्रदेश, ७७ जिल्ला, ७७६ स्थानीय तह र हजारौँ वडाहरूको आधिकारिक सीमाना-तथ्याङ्क प्रयोग गरिएको छ (सरलीकृत GeoJSON)।'
            : 'Official boundary data for 7 provinces, 77 districts, 776 local levels and thousands of wards (simplified GeoJSON).'}
        </p>
        <h3 className="mt14">📚 {ne ? 'ज्ञानकोश' : 'Content'}</h3>
        <p className="small muted mt8">
          {ne
            ? '९०+ प्रसिद्ध ठाउँ, १००+ द्विभाषी क्विज प्रश्न — भूगोल, इतिहास, संस्कृति, चाडपर्व, खेलकुद।'
            : '90+ famous places and 100+ bilingual trivia questions — geography, history, culture, festivals and sports.'}
        </p>
        <h3 className="mt14">💡 {ne ? 'किन खेल्ने?' : 'Why play?'}</h3>
        <ul className="small muted" style={{ lineHeight: 1.9, paddingLeft: 18 }}>
          <li>{ne ? 'दैनिक चुनौतीले स्ट्रिक बनाउँछ — साथीहरूसँग प्रतिस्पर्धा!' : 'Daily challenges build streaks — compete with friends!'}</li>
          <li>{ne ? 'हरेक उत्तरसँग रमाइलो जानकारी — खेल्दै सिकाइ।' : 'Every answer comes with a fun fact — learning while playing.'}</li>
          <li>{ne ? 'पासपोर्टका ७७ छाप सङ्कलन गर्नुहोस्।' : 'Collect all 77 passport stamps.'}</li>
        </ul>
      </div>

      <div className="card mt14" style={{ borderColor: 'rgba(239,83,80,.35)' }}>
        <h3>⚠️ Danger zone</h3>
        <p className="small muted mt8">
          {ne ? 'आफ्नो सबै प्रगति मेट्नुहोस् (पूर्वनिर्माण)।' : 'Wipe all your progress (reset to zero).'}
        </p>
        <Btn small kind="ghost" onClick={() => setConfirmReset(true)}>
          🗑️ Reset progress
        </Btn>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)}>
        <h3>{ne ? 'पक्का? सबै मेटिनेछ!' : 'Sure? Everything will be erased!'}</h3>
        <p className="muted small mt8">XP, stamps, badges, streaks… {ne ? 'सबै हराउँछ।' : 'all gone.'}</p>
        <div className="row mt14">
          <Btn onClick={() => {
            localStorage.removeItem('nepalkhel-save-v1');
            location.reload();
          }}>🗑️ Yes, reset</Btn>
          <Btn kind="ghost" onClick={() => setConfirmReset(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}
