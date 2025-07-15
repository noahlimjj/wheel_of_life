import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

const AREAS = [
  { key: 'body', label: 'Body', group: 'Health' },
  { key: 'mind', label: 'Mind', group: 'Health' },
  { key: 'soul', label: 'Soul', group: 'Health' },
  { key: 'romance', label: 'Romance', group: 'Relationships' },
  { key: 'family', label: 'Family', group: 'Relationships' },
  { key: 'friends', label: 'Friends', group: 'Relationships' },
  { key: 'finance', label: 'Finance', group: 'Work' },
  { key: 'mission', label: 'Mission', group: 'Work' },
  { key: 'growth', label: 'Growth', group: 'Work' },
  { key: 'fun', label: 'Fun', group: 'Fun' },
];

const DEFAULT_VALUES = Object.fromEntries(AREAS.map(a => [a.key, 5]));

export default function WheelOfLife({ user }) {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const ref = doc(db, 'wheelOfLife', user.uid);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        setValues({ ...DEFAULT_VALUES, ...snap.data() });
      } else {
        setValues(DEFAULT_VALUES);
      }
      setLoading(false);
    }).catch(e => {
      setError('Failed to load data');
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [user]);

  const handleChange = (key, val) => {
    const v = Math.max(1, Math.min(10, Number(val)));
    setValues(prev => ({ ...prev, [key]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'wheelOfLife', user.uid), values);
    } catch (e) {
      setError('Failed to save');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ textAlign: 'center', margin: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
      <h2>Wheel of Life</h2>
      <RadarChart outerRadius={180} width={400} height={400}
        data={AREAS.map(a => ({ area: a.label, value: values[a.key] }))}>
        <PolarGrid />
        <PolarAngleAxis dataKey="area" />
        <PolarRadiusAxis angle={30} domain={[1, 10]} />
        <Radar name="You" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Tooltip />
      </RadarChart>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ marginTop: 24 }}>
        <table style={{ margin: '0 auto' }}>
          <tbody>
            {AREAS.map(a => (
              <tr key={a.key}>
                <td style={{ textAlign: 'right', paddingRight: 8 }}>{a.group} - {a.label}:</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={values[a.key]}
                    onChange={e => handleChange(a.key, e.target.value)}
                    style={{ width: 48 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" disabled={saving} style={{ marginTop: 16 }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
} 