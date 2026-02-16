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
  const [caption, setCaption] = useState<string | null>(null);
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

  // Tier configuration
  const TIER_CONFIG = {
    FREE: { limit: 3, period: 'week', maxPlatforms: 1, badge: '◯', color: '#9B9B9B' },
    PRO: { limit: 5, period: 'week', maxPlatforms: 999, badge: '◐', color: '#6B9BD1' },
    PREMIUM: { limit: 10, period: 'month', maxPlatforms: 999, badge: '◈', color: '#D4AF37' },
    PLATINUM: { limit: 999999, period: 'month', maxPlatforms: 999, badge: '◆', color: '#E5C278' },
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

      // Get subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', session.user.id)
        .single();

      if (sub) {
        setTier(sub.tier);
      }

      // Get usage for current period
      await fetchUsage(session.user.id, sub?.tier || 'FREE');
      
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async (userId: string, userTier: string) => {
    const config = TIER_CONFIG[userTier as keyof typeof TIER_CONFIG];
    const now = new Date();
    let periodStart = new Date();
    let periodEnd = new Date();

    if (config.period === 'week') {
      // Start of week (Monday)
      const day = periodStart.getDay();
      const diff = periodStart.getDate() - day + (day === 0 ? -6 : 1);
      periodStart.setDate(diff);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    } else {
      // Start of month
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      periodEnd.setHours(23, 59, 59, 999);
    }

    const { data } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .eq('tier', userTier)
      .gte('period_start', periodStart.toISOString())
      .lte('period_end', periodEnd.toISOString())
      .single();

    if (data) {
      setUsageData(data);
    } else {
      // Create usage record if doesn't exist
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
      
      setUsageData(newUsage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setCaption(null);
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
      // Allow deselecting
      setSelectedPlatforms([]);
    } else if (tier === 'FREE' && selectedPlatforms.length >= config.maxPlatforms) {
      // Show upgrade message
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
    
    // Check usage limits
    if (tier !== 'PLATINUM' && usageData && usageData.captions_used >= config.limit) {
      setError(`You've used all ${config.limit} captions this ${config.period}. Upgrade for more!`);
      return;
    }
    
    setGeneratingCaption(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        const res = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Image,
            platforms: selectedPlatforms,
            formData: {
              medium,
              artStyle,
              tone,
              mood,
              audience,
              subject,
              customContext,
              options: {
                includeProcess,
                includeHashtags,
                includeCTA,
                includeEmoji,
                seoOptimized,
              }
            }
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate');
        setCaption(data.caption);

        // Update usage
        if (usageData) {
          await supabase
            .from('usage')
            .update({ captions_used: usageData.captions_used + 1 })
            .eq('id', usageData.id);
          
          setUsageData({ ...usageData, captions_used: usageData.captions_used + 1 });
        }
      };
      reader.readAsDataURL(image);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const canGenerate = image && selectedPlatforms.length > 0 && medium;

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
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Playfair Display', serif;
        }

        .brush-stroke {
          position: relative;
        }
        
        .brush-stroke::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%,
            ${theme.accent} 20%,
            ${theme.accent} 80%,
            transparent 100%
          );
        }

        .art-texture {
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 4px);
        }
      `}</style>

      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
        {/* Subtle texture overlay */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none art-texture"></div>

        {/* Header */}
        <header className={`relative ${theme.border} border-b ${theme.headerBg} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <h1 className={`text-5xl md:text-6xl font-light tracking-tight ${theme.text}`}>
                  Caption<span className="font-semibold">My.Art</span>
                </h1>
                <div className="h-2 w-2 rounded-full mt-4" style={{ backgroundColor: theme.accent }}></div>
                </div>
                </div>
                
                </div>
                </header>
                {/* Tier Badge */}
                <div className="ml-4 mt-4 flex items-center gap-2 px-3 py-1 rounded-full border-2" style={{ borderColor: config.color }}>
                  <span style={{ color: config.color }} className="text-xl">{config.badge}</span>
                  <span className={`text-xs uppercase tracking-wider font-medium ${theme.text}`}>{tier}</span>
                </div>
              </div>
              
              
              {/* Navigation */}
              <div className="flex items-center gap-6">
                {/* Usage Display */}
                <div className={`text-xs ${theme.textSecondary} font-medium`}>
                  {usageRemaining} / {tier === 'PLATINUM' ? '∞' : config.limit} this {config.period}
                </div>
                
                <Link 
                  href="/pricing" 
                  className={`text-sm ${theme.textSecondary} hover:${theme.text} transition font-medium tracking-wide`}
                >
                  {tier === 'FREE' ? 'Upgrade' : 'Pricing'}
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className={`text-sm ${theme.textSecondary} hover:${theme.text} transition font-medium tracking-wide`}
                >
                  Sign Out
                </button>
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`theme-toggle p-3 ${theme.inputBg} ${theme.inputBorder} border-2 rounded-sm hover:${theme.borderHover} flex items-center gap-2`}
                  aria-label="Toggle theme"
                >
                  <span className="text-xl">{darkMode ? '☀' : '☾'}</span>
                </button>
              </div>
            <p className={`mt-3 ${theme.textSecondary} text-lg font-light tracking-wide`}>
              Elevate your art with intelligent, platform-optimized captions
            </p>
          )

         
        {/* Main Content */}
        
          
          {/* Upgrade Banner (if near limit) */}
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
                      : `Only ${config.limit - usageData.captions_used} caption${config.limit - usageData.captions_used > 1 ? 's' : ''} left this ${config.period}`
                    }
                  </p>
                </div>
                <Link 
                  href="/pricing"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-6 brush-stroke inline-block`}>
              Your Artwork
            </h2>
            
            <div className={`mt-8 ${theme.cardBg} border-2 border-dashed ${theme.inputBorder} rounded-sm hover:${theme.borderHover} transition-colors`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              {imagePreview ? (
                <div className="relative p-8">
                  <img
                    src={imagePreview}
                    alt="Your artwork"
                    className="max-h-125 mx-auto shadow-2xl"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className={`absolute top-12 right-12 ${darkMode ? 'bg-white/90 hover:bg-white text-black' : 'bg-black/80 hover:bg-black text-white'} rounded-full w-10 h-10 flex items-center justify-center text-lg backdrop-blur-sm transition`}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer block p-20 text-center">
                  <div className={`inline-block mb-4 text-6xl font-light ${theme.textTertiary}`}>+</div>
                  <p className={`text-xl font-light ${theme.textSecondary} mb-2`}>Upload your artwork</p>
                  <p className={`text-sm ${theme.textTertiary} font-light tracking-wide`}>
                    JPG, PNG, GIF, or WEBP • Maximum 10MB
                  </p>
                </label>
              )}
            </div>
          </section>

          {/* Platform Selection */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-2 brush-stroke inline-block`}>
              Platforms
            </h2>
            {tier === 'FREE' && (
              <p className={`text-sm ${theme.textTertiary} mt-6 mb-8 font-light`}>
                Free tier: Select 1 platform • <Link href="/pricing" className="underline hover:opacity-80">Upgrade</Link> for multiple platforms
              </p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-8">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  disabled={tier === 'FREE' && selectedPlatforms.length >= 1 && !selectedPlatforms.includes(platform.id)}
                  className={`
                    platform-btn relative px-6 py-5 ${theme.cardBg} border-2 rounded-sm text-center transition-all
                    ${
                      selectedPlatforms.includes(platform.id)
                        ? `${theme.inputBorder.replace('border-', 'border-[#')} ${theme.selectedBg} ${theme.selectedText} selected`
                        : `${theme.inputBorder} ${theme.textSecondary} hover:${theme.borderHover}`
                    }
                    ${tier === 'FREE' && selectedPlatforms.length >= 1 && !selectedPlatforms.includes(platform.id) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="text-2xl mb-2 font-light">{platform.icon}</div>
                  <div className="text-xs tracking-wider uppercase font-medium">{platform.name}</div>
                  {selectedPlatforms.includes(platform.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                      <span className={`text-[10px] ${darkMode ? 'text-black' : 'text-black'}`}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Art Details */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-2 brush-stroke inline-block`}>
              Details
            </h2>
            <p className={`text-sm ${theme.textTertiary} mt-6 mb-8 font-light`}>
              Help us understand your work
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medium */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Medium <span style={{ color: theme.accent }}>*</span>
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select medium</option>
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
              </div>

              {/* Art Style */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Style
                </label>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select style</option>
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
              </div>

              {/* Tone */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select tone</option>
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
              </div>

              {/* Mood */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Mood
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select mood</option>
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
              </div>

              {/* Target Audience */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select audience</option>
                  <option value="collectors">Art Collectors</option>
                  <option value="artists">Fellow Artists</option>
                  <option value="general">General Audience</option>
                  <option value="commissioners">Commissioners</option>
                  <option value="fans">Fans & Followers</option>
                  <option value="industry">Industry Professionals</option>
                </select>
              </div>

              {/* Subject Matter */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select subject</option>
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
            </div>

            {/* Additional Context */}
            <div className="mt-8">
              <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                Additional Context
              </label>
              <textarea
                rows={4}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Share the story behind your work, inspiration, techniques, or any details you'd like to include..."
                className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} ${darkMode ? 'placeholder-gray-600' : 'placeholder-gray-400'} font-light resize-none`}
              />
              <p className={`text-xs ${theme.textTertiary} mt-2 font-light`}>{customContext.length} characters</p>
            </div>
          </section>

          {/* Caption Options */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-2 brush-stroke inline-block`}>
              Options
            </h2>
            <p className={`text-sm ${theme.textTertiary} mt-6 mb-8 font-light`}>
              Customize your caption output
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeProcess}
                  onChange={(e) => setIncludeProcess(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Process Details</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Include information about your creative process</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Hashtags</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Add relevant, trending hashtags</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeCTA}
                  onChange={(e) => setIncludeCTA(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Call-to-Action</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Encourage engagement from your audience</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeEmoji}
                  onChange={(e) => setIncludeEmoji(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Emojis</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Add expressive emojis where appropriate</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={seoOptimized}
                  onChange={(e) => setSeoOptimized(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>SEO Optimization</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Optimize for discoverability and search</p>
                </div>
              </label>
            </div>
          </section>

          {/* Generate Button */}
          <div className={`border-t ${theme.border} pt-12`}>
            <button
              onClick={handleGenerate}
              disabled={generatingCaption || !canGenerate || (tier !== 'PLATINUM' && usageData && usageData.captions_used >= config.limit)}
              className={`w-full md:w-auto px-12 py-4 ${theme.buttonBg} ${theme.buttonText} text-sm uppercase tracking-widest font-medium hover:${theme.buttonHover} disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:tracking-[0.3em]`}
            >
              {generatingCaption ? 'Generating...' : 'Generate Caption'}
            </button>
            
            {!canGenerate && image && (
              <p className="text-sm mt-4 font-light" style={{ color: theme.accent }}>
                Please select at least one platform and specify a medium
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mt-12 p-6 ${darkMode ? 'bg-red-950/50 border-l-4 border-red-600' : 'bg-red-50 border-l-4 border-red-600'}`}>
              <p className={`${darkMode ? 'text-red-300' : 'text-red-900'} font-light`}>{error}</p>
            </div>
          )}

          {/* Caption Output */}
          {caption && (
            <div className={`mt-16 border-t ${theme.border} pt-16`}>
              <h2 className={`text-3xl font-light ${theme.text} mb-8 brush-stroke inline-block`}>
                Your Caption
              </h2>
              
              <div className={`${theme.cardBg} border-2 ${theme.inputBorder} p-8`}>
                <pre className={`whitespace-pre-wrap font-light ${theme.text} leading-relaxed text-base`}>
                  {caption}
                </pre>
              </div>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(caption);
                  alert('Caption copied to clipboard');
                }}
                className={`mt-6 px-8 py-3 border-2 ${theme.inputBorder} ${theme.text} text-xs uppercase tracking-widest font-medium hover:${theme.buttonBg} hover:${theme.buttonText} transition-all`}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        

        {/* Footer */}
        <footer className={`border-t ${theme.border} mt-24 py-8`}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className={`text-xs ${theme.textTertiary} tracking-wider uppercase font-light`}>
              Crafted for Artists
            </p>
          </div>
        </footer>
     </>
  )};
