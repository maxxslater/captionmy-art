'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>('FREE');
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<any>(null);
  
  // Form state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [captions, setCaptions] = useState<Array<{platform: string, caption: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [medium, setMedium] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [tone, setTone] = useState('');
  const [mood, setMood] = useState('');
  const [audience, setAudience] = useState('');
  const [subject, setSubject] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [includeProcess, setIncludeProcess] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [includeEmoji, setIncludeEmoji] = useState(false);
  const [seoOptimized, setSeoOptimized] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Tier configuration
  const TIER_CONFIG = {
    FREE: { limit: 3, period: 'week', maxPlatforms: 1, badge: '◯', color: '#9B9B9B' },
    PRO: { limit: 5, period: 'week', maxPlatforms: 999, badge: '◐', color: '#6B9BD1' },
    PREMIUM: { limit: 10, period: 'month', maxPlatforms: 999, badge: '◈', color: '#D4AF37' },
    PLATINUM: { limit: 999999, period: 'month', maxPlatforms: 999, badge: '◆', color: '#E5C278' },
  };

  const theme = {
    bg: darkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAF8]',
    cardBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    headerBg: darkMode ? 'bg-[#1A1A1A]/80' : 'bg-white/80',
    text: darkMode ? 'text-[#E5E5E5]' : 'text-[#1A1A1A]',
    textSecondary: darkMode ? 'text-[#A0A0A0]' : 'text-[#6B6B6B]',
    textTertiary: darkMode ? 'text-[#707070]' : 'text-[#9B9B9B]',
    border: darkMode ? 'border-[#2A2A2A]' : 'border-gray-200',
    borderHover: darkMode ? 'border-[#3A3A3A]' : 'border-gray-400',
    inputBorder: darkMode ? 'border-[#2A2A2A]' : 'border-gray-300',
    inputBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    buttonBg: darkMode ? 'bg-[#E5E5E5]' : 'bg-[#1A1A1A]',
    buttonText: darkMode ? 'text-[#0A0A0A]' : 'text-white',
    buttonHover: darkMode ? 'bg-white' : 'bg-black',
    accent: darkMode ? '#E5C278' : '#D4AF37',
    selectedBg: darkMode ? 'bg-[#E5E5E5]' : 'bg-[#1A1A1A]',
    selectedText: darkMode ? 'text-[#0A0A0A]' : 'text-white',
  };

  // Check auth on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/signin');
        return;
      }

      setUser(session.user);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', session.user.id)
        .single();

      if (sub) {
        setTier(sub.tier);
      }

      await fetchUsage(session.user.id, sub?.tier || 'FREE');
      
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async (userId: string, userTier: string) => {
  // Just get the most recent usage record for this user and tier
  // Don't filter by date - just get whatever exists
  const { data, error } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .eq('tier', userTier)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle instead of single - won't error if not found

  console.log('Usage fetch result:', data, error); // DEBUG

  if (data) {
    setUsageData(data);
  } else {
    // Create new usage record
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 7);

    const { data: newUsage } = await supabase
      .from('usage')
      .insert({
        user_id: userId,
        tier: userTier,
        captions_used: 0,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      })
      .select()
      .single();
    
    console.log('Created new usage:', newUsage); // DEBUG
    setUsageData(newUsage);
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setCaptions([]);
      setError(null);
    }
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '○' },
    { id: 'tiktok', name: 'TikTok', icon: '◐' },
    { id: 'twitter', name: 'X', icon: '✕' },
    { id: 'reddit', name: 'Reddit', icon: '◉' },
    { id: 'artstation', name: 'ArtStation', icon: '◈' },
    { id: 'deviantart', name: 'DeviantArt', icon: '◆' },
  ];

  const togglePlatform = (platformId: string) => {
    const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
    
    if (tier === 'FREE' && selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms([]);
    } else if (tier === 'FREE' && selectedPlatforms.length >= config.maxPlatforms) {
      setError('Free tier limited to 1 platform. Upgrade to select multiple!');
      return;
    } else {
      setSelectedPlatforms(prev =>
        prev.includes(platformId)
          ? prev.filter(p => p !== platformId)
          : [...prev, platformId]
      );
      setError(null);
    }
  };
const handleGenerate = async () => {
  if (!image || !user) return;

  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  
  console.log('Usage check:', {
    tier,
    captionsUsed: usageData?.captions_used,
    limit: config.limit,
    willBlock: tier !== 'PLATINUM' && usageData && usageData.captions_used >= config.limit
  });
  
  if (tier !== 'PLATINUM' && usageData && usageData.captions_used >= config.limit) {
    setShowUpgradeModal(true);
    return;
  }
  
  setGeneratingCaption(true);
  setError(null);
  
  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const base64Image = (reader.result as string).split(',')[1];
      
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          platforms: selectedPlatforms,
          formData: {
            medium, artStyle, tone, mood, audience, subject, customContext,
            options: { includeProcess, includeHashtags, includeCTA, includeEmoji, seoOptimized }
          }
        }),
      });

      const responseData = await res.json();
      
      if (!res.ok) throw new Error(responseData.error || 'Failed to generate');

      if (responseData.captions && Array.isArray(responseData.captions)) {
        setCaptions(responseData.captions);
      } else if (responseData.caption) {
        setCaptions([{ platform: selectedPlatforms[0] || 'instagram', caption: responseData.caption }]);
      } else {
        throw new Error('No caption returned');
      }

      if (usageData) {
  await supabase
    .from('usage')
    .update({ 
      captions_used: usageData.captions_used + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', usageData.id);
  
  setUsageData({ ...usageData, captions_used: usageData.captions_used + 1 });
} else {
  // Create new record if doesn't exist
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 7);

  const { data: newUsage } = await supabase
    .from('usage')
    .insert({
      user_id: user.id,
      tier: tier,
      captions_used: 1,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .select()
    .single();
  
  setUsageData(newUsage);
}

    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingCaption(false);
    }
  };
  reader.readAsDataURL(image);
};

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const canGenerate = image && selectedPlatforms.length > 0 && medium;

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <p className={theme.text}>Loading...</p>
      </div>
    );
  }

  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  const usageRemaining = tier === 'PLATINUM' ? '∞' : (config.limit - (usageData?.captions_used || 0));

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        .brush-stroke::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, ${theme.accent} 20%, ${theme.accent} 80%, transparent 100%);
        }
      `}</style>

      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
        <header className={`relative ${theme.border} border-b ${theme.headerBg} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h1 className={`text-4xl md:text-5xl font-light tracking-tight ${theme.text}`}>
                  Caption<span className="font-semibold">My.Art</span>
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border-2" style={{ borderColor: config.color }}>
                  <span style={{ color: config.color }} className="text-lg">{config.badge}</span>
                  <span className={`text-xs uppercase tracking-wider font-medium ${theme.text}`}>{tier}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-xs ${theme.textSecondary} font-medium`}>
                  {usageRemaining} / {tier === 'PLATINUM' ? '∞' : config.limit} this {config.period}
                </div>
                <Link href="/pricing" className={`text-sm ${theme.textSecondary} hover:${theme.text} transition`}>
                  {tier === 'FREE' ? 'Upgrade' : 'Pricing'}
                </Link>
                <button onClick={handleSignOut} className={`text-sm ${theme.textSecondary} hover:${theme.text} transition`}>
                  Sign Out
                </button>
                <button onClick={() => setDarkMode(!darkMode)} className={`p-2 ${theme.inputBg} ${theme.inputBorder} border-2 rounded-sm`}>
                  <span className="text-xl">{darkMode ? '☀' : '☾'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-6 py-12">
          {tier !== 'PLATINUM' && usageData && usageData.captions_used >= config.limit - 1 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {usageData.captions_used >= config.limit ? '🎯 Limit Reached!' : '⚠️ Almost Out!'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {usageData.captions_used >= config.limit 
                      ? `You've used all ${config.limit} captions this ${config.period}`
                      : `Only ${config.limit - usageData.captions_used} caption left`
                    }
                  </p>
                </div>
                <Link href="/pricing" className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition">
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}

          <section className="mb-12">
            <h2 className={`text-2xl font-light ${theme.text} mb-4`}>Upload Artwork</h2>
            <div className={`${theme.cardBg} border-2 border-dashed ${theme.inputBorder} rounded-sm p-8`}>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-96 mx-auto rounded" />
                  <button onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-black/80 text-white rounded-full w-8 h-8">×</button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer block text-center py-12">
                  <div className={`text-5xl mb-4 ${theme.textTertiary}`}>+</div>
                  <p className={theme.textSecondary}>Click to upload</p>
                </label>
              )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-light ${theme.text} mb-4`}>Platforms</h2>
            {tier === 'FREE' && (
              <p className={`text-sm ${theme.textTertiary} mb-4`}>
                Free tier: 1 platform only • <Link href="/pricing" className="underline">Upgrade</Link> for more
              </p>
            )}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {platforms.map((p) => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  disabled={tier === 'FREE' && selectedPlatforms.length >= 1 && !selectedPlatforms.includes(p.id)}
                  className={`p-4 border-2 rounded-sm ${
                    selectedPlatforms.includes(p.id) ? `${theme.selectedBg} ${theme.selectedText}` : `${theme.cardBg} ${theme.inputBorder}`
                  } ${tier === 'FREE' && selectedPlatforms.length >= 1 && !selectedPlatforms.includes(p.id) ? 'opacity-50' : ''}`}>
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div className="text-xs">{p.name}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-light ${theme.text} mb-4`}>Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Medium */}
              <select value={medium} onChange={(e) => setMedium(e.target.value)}
                className={`px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text}`}>
                <option value="">Medium *</option>
                <option value="digital">Digital Art</option>
                <option value="oil">Oil Painting</option>
                <option value="watercolor">Watercolor</option>
                <option value="acrylic">Acrylic</option>
                <option value="pencil">Pencil / Graphite</option>
                <option value="ink">Ink</option>
                <option value="charcoal">Charcoal</option>
                <option value="pastel">Pastel</option>
                <option value="mixed-media">Mixed Media</option>
                <option value="3d">3D Art</option>
                <option value="sculpture">Sculpture</option>
                <option value="photography">Photography</option>
                <option value="collage">Collage</option>
                <option value="pixel-art">Pixel Art</option>
                <option value="vector">Vector Art</option>
              </select>

              {/* Art Style */}
              <select value={artStyle} onChange={(e) => setArtStyle(e.target.value)}
                className={`px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text}`}>
                <option value="">Style</option>
                <option value="realism">Realism</option>
                <option value="abstract">Abstract</option>
                <option value="impressionism">Impressionism</option>
                <option value="surrealism">Surrealism</option>
                <option value="anime">Anime / Manga</option>
                <option value="cartoon">Cartoon</option>
                <option value="concept-art">Concept Art</option>
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Science Fiction</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="still-life">Still Life</option>
                <option value="minimalist">Minimalist</option>
                <option value="pop-art">Pop Art</option>
                <option value="street-art">Street Art</option>
                <option value="gothic">Gothic</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>

              {/* Tone */}
              <select value={tone} onChange={(e) => setTone(e.target.value)}
                className={`px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text}`}>
                <option value="">Tone</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="playful">Playful</option>
                <option value="inspirational">Inspirational</option>
                <option value="storytelling">Storytelling</option>
                <option value="minimalist">Minimalist</option>
                <option value="educational">Educational</option>
                <option value="provocative">Provocative</option>
                <option value="humble">Humble</option>
                <option value="confident">Confident</option>
              </select>

              {/* Mood */}
              <select value={mood} onChange={(e) => setMood(e.target.value)}
                className={`px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text}`}>
                <option value="">Mood</option>
                <option value="dreamy">Dreamy</option>
                <option value="bold">Bold</option>
                <option value="melancholic">Melancholic</option>
                <option value="energetic">Energetic</option>
                <option value="peaceful">Peaceful</option>
                <option value="dark">Dark</option>
                <option value="whimsical">Whimsical</option>
                <option value="mysterious">Mysterious</option>
                <option value="joyful">Joyful</option>
                <option value="nostalgic">Nostalgic</option>
              </select>

              {/* Audience */}
              <select value={audience} onChange={(e) => setAudience(e.target.value)}
                className={`px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text}`}>
                <option value="">Audience</option>
                <option value="collectors">Art Collectors</option>
                <option value="artists">Fellow Artists</option>
                <option value="general">General Audience</option>
                <option value="commissioners">Commissioners</option>
                <option value="fans">Fans & Followers</option>
                <option value="industry">Industry Professionals</option>
              </select>

              {/* Subject */}
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className={`px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text}`}>
                <option value="">Subject</option>
                <option value="character">Character / Person</option>
                <option value="creature">Creature / Monster</option>
                <option value="environment">Environment / Scene</option>
                <option value="object">Object / Product</option>
                <option value="nature">Nature</option>
                <option value="architecture">Architecture</option>
                <option value="vehicle">Vehicle</option>
                <option value="food">Food</option>
                <option value="abstract-concept">Abstract Concept</option>
                <option value="fan-art">Fan Art</option>
              </select>
            </div>

            {/* Additional Context */}
            <div className="mt-6">
              <textarea value={customContext} onChange={(e) => setCustomContext(e.target.value)}
                rows={4} placeholder="Share the story behind your work..."
                className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} placeholder-gray-400 resize-none`}
              />
              <p className={`text-xs ${theme.textTertiary} mt-1`}>{customContext.length} characters</p>
            </div>
          </section>

          {/* Caption Options */}
          <section className="mb-12">
            <h2 className={`text-2xl font-light ${theme.text} mb-4`}>Options</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeProcess} onChange={(e) => setIncludeProcess(e.target.checked)} />
                <span className={`text-sm ${theme.text}`}>Process Details</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} />
                <span className={`text-sm ${theme.text}`}>Hashtags</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeCTA} onChange={(e) => setIncludeCTA(e.target.checked)} />
                <span className={`text-sm ${theme.text}`}>Call-to-Action</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeEmoji} onChange={(e) => setIncludeEmoji(e.target.checked)} />
                <span className={`text-sm ${theme.text}`}>Emojis</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={seoOptimized} onChange={(e) => setSeoOptimized(e.target.checked)} />
                <span className={`text-sm ${theme.text}`}>SEO Optimized</span>
              </label>
            </div>
          </section>

          <button 
  onClick={handleGenerate}
  disabled={generatingCaption || !canGenerate || (tier !== 'PLATINUM' && usageData && usageData.captions_used >= config.limit)}
  className={`w-full px-12 py-4 ${theme.buttonBg} ${theme.buttonText} uppercase tracking-wider font-medium disabled:opacity-30`}>
  {generatingCaption ? (
    <span className="flex items-center justify-center gap-3">
      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating Caption...</span>
    </span>
  ) : 'Generate Caption'}
</button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-600">
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {captions.length > 0 && (
            <div className="mt-12">
              <h2 className={`text-3xl font-light ${theme.text} mb-6`}>
                Your {captions.length > 1 ? 'Platform-Specific Captions' : 'Caption'}
              </h2>
              
              <div className="space-y-6">
                {captions.map((item, index) => {
                  const platformInfo = platforms.find(p => p.id === item.platform);
                  return (
                    <div key={index} className={`${theme.cardBg} border-2 ${theme.inputBorder} rounded-sm overflow-hidden`}>
                      {/* Platform Header */}
                      <div className={`px-6 py-4 border-b-2 ${theme.inputBorder} flex items-center justify-between`} style={{ backgroundColor: darkMode ? '#0F0F0F' : '#F9F9F9' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{platformInfo?.icon}</span>
                          <div>
                            <h3 className={`font-medium ${theme.text}`}>{platformInfo?.name}</h3>
                            <p className={`text-xs ${theme.textTertiary}`}>Optimized for {item.platform}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(item.caption);
                            alert(`${platformInfo?.name} caption copied!`);
                          }}
                          className={`px-4 py-2 border-2 ${theme.inputBorder} ${theme.text} text-xs uppercase tracking-wider font-medium rounded-sm hover:${theme.buttonBg} hover:${theme.buttonText} transition`}>
                          Copy
                        </button>
                      </div>
                      
                      {/* Caption Content */}
                      <div className="p-6">
                        <pre className={`whitespace-pre-wrap ${theme.text} font-light leading-relaxed text-sm`}>
                          {item.caption}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Copy All Button */}
              {captions.length > 1 && (
                <button 
                  onClick={() => {
                    const allCaptions = captions.map(c => {
                      const p = platforms.find(pl => pl.id === c.platform);
                      return `━━━━━ ${p?.name.toUpperCase()} ━━━━━\n\n${c.caption}\n\n`;
                    }).join('\n');
                    navigator.clipboard.writeText(allCaptions);
                    alert('All captions copied to clipboard!');
                  }}
                  className={`mt-6 px-8 py-3 ${theme.buttonBg} ${theme.buttonText} text-xs uppercase tracking-widest font-medium rounded-sm hover:opacity-90 transition`}>
                  Copy All Captions
                </button>
              )}
            </div>
          )}
        </main>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowUpgradeModal(false)}>
            <div className={`${theme.cardBg} max-w-lg w-full rounded-lg p-8 border-2`} style={{ borderColor: theme.accent }} onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button onClick={() => setShowUpgradeModal(false)} className={`absolute top-4 right-4 ${theme.textSecondary} hover:${theme.text} text-2xl`}>
                ×
              </button>

              {/* Icon */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className={`text-3xl font-light ${theme.text} mb-2`}>You've Hit Your Limit!</h2>
                <p className={`text-lg ${theme.textSecondary}`}>
                  You've used all <span className="font-semibold">{config.limit} captions</span> this {config.period}
                </p>
              </div>

              {/* Benefits */}
              <div className={`${theme.inputBg} border-2 ${theme.inputBorder} rounded-lg p-6 mb-6`}>
                <p className={`text-sm ${theme.textSecondary} mb-4 font-medium uppercase tracking-wider`}>Upgrade to get:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className={theme.text}>More captions per week</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className={theme.text}>Multiple platform selection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className={theme.text}>Community access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: theme.accent }}>✓</span>
                    <span className={theme.text}>Priority support</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link href="/pricing" 
                  className={`block w-full text-center py-3 ${theme.buttonBg} ${theme.buttonText} font-medium rounded-lg hover:opacity-90 transition uppercase tracking-wide`}>
                  View Plans & Upgrade
                </Link>
                <button onClick={() => setShowUpgradeModal(false)}
                  className={`w-full py-3 border-2 ${theme.inputBorder} ${theme.textSecondary} rounded-lg hover:${theme.text} transition`}>
                  Maybe Later
                </button>
              </div>

              {/* Reset info */}
              <p className={`text-xs ${theme.textTertiary} text-center mt-4`}>
                Your free captions reset next {config.period === 'week' ? 'Monday' : 'month'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}